'use strict';

const WS_URL = 'ws://127.0.0.1:8765';
const RECONNECT_DELAY_MS = 3000;
const JSON_RPC_VERSION = '2.0';

/** @type {WebSocket | null} */
let socket = null;

/** @type {boolean} */
let intentionalClose = false;

/**
 * Maps a composite key of tabId:requestId to the chrome.runtime response callback
 * so that when the WebSocket returns a result the correct sender can be resolved.
 * @type {Map<string, Function>}
 */
const pendingCallbacks = new Map();

/**
 * Builds the composite pending-map key for a given tab and request ID.
 * @param {number} tabId - The Chrome tab ID of the originating content script.
 * @param {number} requestId - The JSON-RPC request ID assigned by the injected provider.
 * @returns {string} The composite key string.
 */
function pendingKey(tabId, requestId) {
  return `${tabId}:${requestId}`;
}

/**
 * Handles a raw message received from the CointMU Electron WebSocket server.
 * Parses the JSON-RPC response and routes it to the pending callback for the
 * originating tab, then removes the callback from the map.
 * @param {MessageEvent} event - The WebSocket message event from the Electron server.
 * @returns {void}
 */
function handleSocketMessage(event) {
  let payload;
  try {
    payload = JSON.parse(event.data);
  } catch {
    console.error('[CointMU-bg] Received malformed JSON from WS server:', event.data);
    return;
  }

  if (payload.type === 'LINK_APPROVED') {
    chrome.storage.local.set({ isLinked: true });
    return;
  } else if (payload.type === 'LINK_REJECTED') {
    chrome.storage.local.set({ isLinked: false });
    return;
  } else if (payload.type === 'FORCE_UNLINK') {
    chrome.storage.local.remove(['isLinked', 'walletState']);
    return;
  } else if (payload.type === 'WALLET_STATE') {
    chrome.storage.local.set({ isLinked: true, walletState: payload });
    return;
  }

  const { __tabId, id, result, error } = payload;
  if (__tabId === undefined || id === undefined) return;

  const key = pendingKey(__tabId, id);
  const callback = pendingCallbacks.get(key);
  if (!callback) return;

  pendingCallbacks.delete(key);
  callback({ result: result ?? null, error: error ?? null });
}

/**
 * Opens the WebSocket connection to the CointMU Electron application and
 * registers event handlers. If the socket closes unexpectedly a reconnect
 * attempt is scheduled after RECONNECT_DELAY_MS milliseconds. All pending
 * callbacks are rejected with a connection-lost error on close so waiting
 * dApp promises do not hang indefinitely.
 * @returns {void}
 */
function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  intentionalClose = false;
  socket = new WebSocket(WS_URL);

  socket.addEventListener('open', function () {
    console.log('[CointMU-bg] WebSocket connected to Electron.');
  });

  socket.addEventListener('message', handleSocketMessage);

  socket.addEventListener('close', function () {
    socket = null;
    pendingCallbacks.forEach(function (callback) {
      callback({ result: null, error: { message: 'CointMU desktop wallet disconnected.' } });
    });
    pendingCallbacks.clear();

    if (!intentionalClose) {
      setTimeout(connect, RECONNECT_DELAY_MS);
    }
  });

  socket.addEventListener('error', function (err) {
    console.error('[CointMU-bg] WebSocket error:', err);
  });
}

/**
 * Closes the WebSocket connection cleanly, preventing the automatic reconnect
 * logic from triggering.
 * @returns {void}
 */
function disconnect() {
  intentionalClose = true;
  if (socket) {
    socket.close();
    socket = null;
  }
}

/**
 * Receives a JSON-RPC request message forwarded by a content script, tags it
 * with the originating tab ID so the response can be routed back, stores the
 * reply callback in the pending map, and transmits the payload over the
 * WebSocket to the Electron application. If the socket is not yet open the
 * callback is immediately invoked with an error.
 * @param {{ id: number, method: string, params: unknown[] }} message - The JSON-RPC request from the content script.
 * @param {chrome.runtime.MessageSender} sender - The sender metadata including the originating tab.
 * @param {Function} sendResponse - The chrome.runtime reply function to call with the result.
 * @returns {boolean} Returns true to keep the message channel open for the async response.
 */
function handleContentMessage(message, sender, sendResponse) {
  if (message.action === 'REQUEST_LINK' || message.action === 'AUTO_RECONNECT') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: message.action }));
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'WebSocket not connected' });
    }
    return false;
  }

  const tabId = sender.tab?.id;
  if (tabId === undefined) {
    sendResponse({ result: null, error: { message: 'Sender has no tab context.' } });
    return false;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    sendResponse({ result: null, error: { message: 'CointMU desktop wallet is not connected.' } });
    return false;
  }

  const { id, method, params, origin } = message;
  const key = pendingKey(tabId, id);
  pendingCallbacks.set(key, sendResponse);

  const wsPayload = JSON.stringify({
    jsonrpc: JSON_RPC_VERSION,
    id,
    method,
    params: params || [],
    __tabId: tabId,
    origin: origin || `Tab ${tabId}`
  });

  socket.send(wsPayload);
  return true;
}

chrome.runtime.onMessage.addListener(handleContentMessage);

connect();
