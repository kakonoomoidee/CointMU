'use strict';

importScripts('ethers.umd.min.js');

const WS_URL = 'ws://127.0.0.1:8765';
const RECONNECT_DELAY_MS = 3000;
const JSON_RPC_VERSION = '2.0';

/** @type {WebSocket | null} */
let socket = null;

/** @type {boolean} */
let intentionalClose = false;

/** @type {'desktop' | 'standalone'} */
let connectionMode = 'desktop';

let pingInterval = null;
let pongTimeout = null;

function clearHeartbeat() {
  if (pingInterval) clearInterval(pingInterval);
  if (pongTimeout) clearTimeout(pongTimeout);
  pingInterval = null;
  pongTimeout = null;
}

function startHeartbeat() {
  clearHeartbeat();
  pingInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
      pongTimeout = setTimeout(() => {
        console.warn('[CointMU-bg] Heartbeat timeout, closing socket...');
        chrome.storage.local.set({ isLinked: false });
        if (socket) socket.close();
      }, 5000);
    }
  }, 30000);
}

/**
 * Maps a composite key of tabId:requestId to the chrome.runtime response callback
 * so that when the WebSocket returns a result the correct sender can be resolved.
 * @type {Map<string, Function>}
 */
const pendingCallbacks = new Map();

/**
 * Stores pending dApp requests waiting for user approval via the popup.
 * Keyed by request ID.
 * @type {Map<number, any>}
 */
const pendingApprovals = new Map();

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

  if (payload.type === 'pong') {
    if (pongTimeout) clearTimeout(pongTimeout);
    return;
  } else if (payload.type === 'LINK_APPROVED') {
    connectionMode = 'desktop';
    chrome.storage.local.set({ isLinked: true, connectionMode: 'desktop' });
    return;
  } else if (payload.type === 'LINK_REJECTED') {
    chrome.storage.local.set({ isLinked: false });
    return;
  } else if (payload.type === 'FORCE_UNLINK') {
    chrome.storage.local.remove(['isLinked', 'walletState']);
    return;
  } else if (payload.type === 'WALLET_STATE') {
    connectionMode = 'desktop';
    chrome.storage.local.set({ isLinked: true, connectionMode: 'desktop', walletState: payload });
    return;
  } else if (payload.type === 'ACCOUNTS_LIST') {
    chrome.runtime.sendMessage(payload).catch(() => {});
    return;
  } else if (payload.type === 'REVOKE_SITE') {
    if (payload.origin) {
      chrome.tabs.query({ url: payload.origin + '/*' }, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'REVOKE_SITE' }).catch(() => {});
          }
        }
      });
    }
    return;
  } else if (payload.type === 'ACCOUNTS_CHANGED') {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'ACCOUNTS_CHANGED', accounts: payload.accounts }).catch(() => {});
        }
      }
    });
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
    chrome.storage.local.set({ isReconnecting: false });
    if (connectionMode === 'desktop') {
      startHeartbeat();
    }
  });

  socket.addEventListener('message', handleSocketMessage);

  socket.addEventListener('close', function () {
    clearHeartbeat();
    chrome.storage.local.set({ isReconnecting: true });
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

const approvalQueue = new Map();

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

  if (method === 'eth_requestAccounts' || method === 'eth_sendTransaction') {
    approvalQueue.set(id, { id, method, params, origin: origin || `Tab ${tabId}`, tabId, wsPayload, sendResponse });
    chrome.windows.create({
      url: `popup.html?mode=approve&reqId=${id}`,
      type: 'popup',
      width: 360,
      height: 700
    });
    return true; // Keep message channel open
  } else {
    socket.send(wsPayload);
    return true;
  }
}

/**
 * Handles internal extension messages from the popup UI.
 * @param {any} message - The message payload.
 * @param {chrome.runtime.MessageSender} sender - The sender.
 * @param {Function} sendResponse - The reply callback.
 * @returns {boolean}
 */
function handleInternalMessage(message, sender, sendResponse) {
  if (message.action === 'REQUEST_LINK') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'REQUEST_LINK' }));
      sendResponse({ success: true });
    } else {
      connect();
      const onOpen = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'REQUEST_LINK' }));
        }
        if (socket) socket.removeEventListener('open', onOpen);
      };
      if (socket) socket.addEventListener('open', onOpen);
      sendResponse({ success: true });
    }
    return false;
  }

  if (message.action === 'AUTO_RECONNECT' || message.action === 'GET_ACCOUNTS') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: message.action }));
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'WebSocket not connected' });
    }
    return false;
  }

  if (message.action === 'GET_CURRENT_STATE') {
    chrome.storage.local.get(['isLinked', 'walletState', 'connectionMode', 'wallets', 'customNetworks', 'activeStandaloneAddress', 'activeNetworkId']).then(res => {
      sendResponse({ 
        isLinked: res.isLinked === true,
        isReconnecting: res.isReconnecting === true,
        walletState: res.walletState,
        connectionMode: res.connectionMode || 'desktop',
        wallets: res.wallets || [],
        customNetworks: res.customNetworks || [],
        activeStandaloneAddress: res.activeStandaloneAddress || null,
        activeNetworkId: res.activeNetworkId || 'cointmu'
      });
    });
    return true;
  }

  if (message.action === 'IMPORT_PRIVATE_KEY') {
    try {
      const wallet = new ethers.Wallet(message.privateKey);
      const address = wallet.address;
      
      chrome.storage.local.get(['wallets'], (res) => {
        let wallets = res.wallets || [];
        // Check if exists
        const exists = wallets.find(w => w.address === address);
        if (!exists) {
          wallets.push({ privateKey: message.privateKey, address });
        }
        
        connectionMode = 'standalone';
        
        const standaloneState = {
          type: 'WALLET_STATE',
          address: address,
          accounts: [address],
          balance: '0.00',
          network: 'Standalone'
        };

        chrome.storage.local.set({ 
          isLinked: true, 
          connectionMode: 'standalone',
          walletState: standaloneState,
          wallets: wallets,
          activeStandaloneAddress: address
        }).then(() => {
          disconnect(); // Disconnect from desktop WS
          sendResponse({ success: true, address });
        }).catch((err) => {
          console.error('Failed to save to local storage', err);
          sendResponse({ success: false, error: 'Storage save failed' });
        });
      });
    } catch (err) {
      console.error('Derivation error:', err);
      sendResponse({ success: false, error: 'Invalid private key or derivation failed' });
    }
    return true;
  }

  if (message.action === 'ADD_CUSTOM_NETWORK') {
    chrome.storage.local.get(['customNetworks'], (res) => {
      let customNetworks = res.customNetworks || [];
      const newNetwork = {
        id: 'custom_' + Date.now(),
        name: message.name,
        rpcUrl: message.rpcUrl,
        chainId: message.chainId
      };
      customNetworks.push(newNetwork);
      chrome.storage.local.set({ customNetworks, activeNetworkId: newNetwork.id }).then(() => {
        sendResponse({ success: true, network: newNetwork });
      });
    });
    return true;
  }

  if (message.action === 'SWITCH_NETWORK') {
    chrome.storage.local.set({ activeNetworkId: message.networkId }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'SWITCH_ACCOUNT') {
    if (message.mode === 'standalone' || (connectionMode === 'standalone' && !message.mode)) {
      connectionMode = 'standalone';
      chrome.storage.local.get(['customNetworks', 'activeNetworkId']).then(res => {
        const customNet = (res.customNetworks || []).find(n => n.id === res.activeNetworkId);
        
        const finishSwitch = (balanceStr) => {
          const standaloneState = {
            type: 'WALLET_STATE',
            address: message.address,
            accounts: [message.address],
            balance: balanceStr,
            network: 'Standalone'
          };
          chrome.storage.local.set({ 
            activeStandaloneAddress: message.address, 
            connectionMode: 'standalone',
            walletState: standaloneState
          }).then(() => {
            sendResponse({ success: true });
            disconnect();
          });
        };

        if (customNet) {
          const provider = new ethers.JsonRpcProvider(customNet.rpcUrl);
          provider.getBalance(message.address).then(bal => {
            finishSwitch(ethers.formatEther(bal));
          }).catch(err => {
            console.error('[CointMU-bg] Failed to fetch balance on switch:', err);
            finishSwitch('0.00');
          });
        } else {
          finishSwitch('0.00');
        }
      });
      return true;
    } else {
      connectionMode = 'desktop';
      chrome.storage.local.set({ connectionMode: 'desktop' });
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: message.action, address: message.address }));
        sendResponse({ success: true });
      } else {
        connect();
        const onOpen = () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: message.action, address: message.address }));
          }
          if (socket) socket.removeEventListener('open', onOpen);
        };
        if (socket) socket.addEventListener('open', onOpen);
        sendResponse({ success: true });
      }
      return false;
    }
  }

  if (message.action === 'GET_PENDING_REQ') {
    const data = approvalQueue.get(Number(message.reqId));
    // Do not include sendResponse in the response to the popup as it can't be serialized
    if (data) {
      const { id, method, params, origin, tabId, wsPayload } = data;
      sendResponse({ success: true, data: { id, method, params, origin, tabId, wsPayload } });
    } else {
      sendResponse({ success: false });
    }
    return false;
  }

  if (message.action === 'RESOLVE_REQ') {
    const reqId = Number(message.reqId);
    const entry = approvalQueue.get(reqId);
    if (!entry) {
      console.error('[CointMU-bg] Request not found in queue for id:', reqId);
      sendResponse({ success: false, error: 'Request not found in queue' });
      return false;
    }

    approvalQueue.delete(reqId);
    const key = pendingKey(entry.tabId, reqId);

    if (message.approved === false) {
      pendingCallbacks.delete(key);
      entry.sendResponse({ result: null, error: { code: 4001, message: 'User Rejected Request' } });
    } else if (message.approved === true) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        pendingCallbacks.set(key, entry.sendResponse);
        console.log('[CointMU-bg] Forwarding approved payload to Desktop', entry.wsPayload);
        socket.send(entry.wsPayload);
      } else {
        pendingCallbacks.delete(key);
        entry.sendResponse({ result: null, error: { message: 'WebSocket disconnected before execution.' } });
      }
    }
    sendResponse({ success: true });
    return false;
  }

  return false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action) {
    return handleInternalMessage(message, sender, sendResponse);
  } else {
    return handleContentMessage(message, sender, sendResponse);
  }
});

chrome.storage.local.get(['isLinked', 'connectionMode']).then(res => {
  if (res.isLinked && res.connectionMode === 'desktop') {
    connect();
  }
});
