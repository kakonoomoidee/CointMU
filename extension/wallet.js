'use strict';

import { socket, connect, disconnect } from './socket.js';

export const JSON_RPC_VERSION = '2.0';

/** @type {'desktop' | 'standalone'} */
export let connectionMode = 'desktop';

export function setConnectionMode(mode) {
  connectionMode = mode;
}

/**
 * Maps a composite key of tabId:requestId to the chrome.runtime response callback
 * so that when the WebSocket returns a result the correct sender can be resolved.
 * @type {Map<string, Function>}
 */
export const pendingCallbacks = new Map();

/**
 * Stores pending dApp requests waiting for user approval via the popup.
 * Keyed by request ID.
 * @type {Map<number, any>}
 */
export const approvalQueue = new Map();

/**
 * Builds the composite pending-map key for a given tab and request ID.
 * @param {number} tabId - The Chrome tab ID of the originating content script.
 * @param {number} requestId - The JSON-RPC request ID assigned by the injected provider.
 * @returns {string} The composite key string.
 */
export function pendingKey(tabId, requestId) {
  return `${tabId}:${requestId}`;
}

/**
 * Handles a raw message received from the CointMU Electron WebSocket server.
 * Parses the JSON-RPC response and routes it to the pending callback for the
 * originating tab, then removes the callback from the map.
 * @param {MessageEvent} event - The WebSocket message event from the Electron server.
 * @returns {void}
 */
export function handleSocketMessage(event) {
  let payload;
  try {
    payload = JSON.parse(event.data);
  } catch {
    console.error('[CointMU-bg] Received malformed JSON from WS server:', event.data);
    return;
  }

  if (payload.type === 'pong') {
    // handled by socket.js if we wanted, but we can just import the clear here if needed.
    // simpler to let the timeout clear it if it fails. The actual timeout clearance
    // is in socket.js. We can emit an event or just do it.
    // For now we will just use a global function or skip. 
    // Wait, let's import the timer handles from socket.js
    import('./socket.js').then(module => {
      module.clearHeartbeat();
      if (connectionMode === 'desktop') module.startHeartbeat();
    });
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
    if (connectionMode === 'standalone') {
      chrome.storage.local.set({ isLinked: true, walletState: payload });
    } else {
      connectionMode = 'desktop';
      chrome.storage.local.set({ isLinked: true, connectionMode: 'desktop', walletState: payload });
    }
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
export function handleContentMessage(message, sender, sendResponse) {
  const tabId = sender.tab?.id;
  if (tabId === undefined) {
    sendResponse({ result: null, error: { message: 'Sender has no tab context.' } });
    return false;
  }

  const { id, method, params, origin } = message;

  chrome.storage.local.get(['connectionMode', 'activeStandaloneAddress', 'wallets', 'activeNetworkId', 'customNetworks']).then(res => {
    if (res.connectionMode === 'standalone') {
      if (method === 'eth_accounts') {
        if (res.activeStandaloneAddress) {
          sendResponse({ result: [res.activeStandaloneAddress], error: null });
        } else {
          sendResponse({ result: [], error: null });
        }
      } else if (method === 'personal_sign') {
        try {
          const messageHex = params[0];
          const requestedAddress = params[1];
          if (!requestedAddress || !res.activeStandaloneAddress || requestedAddress.toLowerCase() !== res.activeStandaloneAddress.toLowerCase()) {
            sendResponse({ result: null, error: { message: 'Requested address does not match active standalone address.' } });
            return;
          }
          const walletData = (res.wallets || []).find(w => w.address.toLowerCase() === res.activeStandaloneAddress.toLowerCase());
          if (!walletData || !walletData.privateKey) {
            sendResponse({ result: null, error: { message: 'Private key not found for active address.' } });
            return;
          }
          const wallet = new globalThis.ethers.Wallet(walletData.privateKey);
          wallet.signMessage(globalThis.ethers.getBytes(messageHex)).then(signature => {
            sendResponse({ result: signature, error: null });
          }).catch(err => {
            sendResponse({ result: null, error: { message: err.message || 'Failed to sign message' } });
          });
        } catch (err) {
          sendResponse({ result: null, error: { message: err.message || 'Failed to parse or sign message' } });
        }
      } else if (method === 'eth_sendTransaction' || method === 'eth_requestAccounts') {
        approvalQueue.set(id, { id, method, params, origin: origin || `Tab ${tabId}`, tabId, sendResponse });
        chrome.windows.create({
          url: `popup.html?mode=approve&reqId=${id}`,
          type: 'popup',
          width: 360,
          height: 700
        });
      } else if (method === 'eth_signTypedData_v4') {
        sendResponse({ result: null, error: { message: 'Method not supported in standalone mode yet.' } });
      } else {
        const customNet = (res.customNetworks || []).find(n => n.id === res.activeNetworkId);
        if (!customNet) {
          sendResponse({ result: null, error: { message: 'No active custom network found.' } });
          return;
        }
        let rpcUrl = customNet.rpcUrl;
        if (!rpcUrl.startsWith('http')) rpcUrl = 'http://' + rpcUrl;
        
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id, method, params })
        }).then(r => r.json()).then(json => {
          sendResponse({ result: json.result, error: json.error });
        }).catch(err => {
          sendResponse({ result: null, error: { message: err.message || 'Failed to fetch from RPC endpoint.' } });
        });
      }
      return;
    }

    if (res.connectionMode === 'desktop') {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        sendResponse({ result: null, error: { message: 'CointMU desktop wallet is not connected.' } });
        return;
      }

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
      } else {
        socket.send(wsPayload);
      }
    }
  });

  return true; // Keep message channel open
}

/**
 * Handles internal extension messages from the popup UI.
 * @param {any} message - The message payload.
 * @param {chrome.runtime.MessageSender} sender - The sender.
 * @param {Function} sendResponse - The reply callback.
 * @returns {boolean}
 */
export function handleInternalMessage(message, sender, sendResponse) {
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
      const isDesktopMode = (res.connectionMode || 'desktop') === 'desktop';
      const hasNoDesktopAccounts = !res.walletState || !Array.isArray(res.walletState.accounts) || res.walletState.accounts.length === 0;

      if (isDesktopMode && hasNoDesktopAccounts) {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'GET_ACCOUNTS' }));
        } else {
          connect();
          const onOpen = () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'GET_ACCOUNTS' }));
            }
            if (socket) socket.removeEventListener('open', onOpen);
          };
          if (socket) socket.addEventListener('open', onOpen);
        }
      }

      sendResponse({ 
        isLinked: res.isLinked === true,
        isReconnecting: res.isReconnecting === true,
        walletState: res.walletState,
        connectionMode: res.connectionMode || 'desktop',
        wallets: res.wallets || [],
        customNetworks: res.customNetworks || [],
        activeStandaloneAddress: res.activeStandaloneAddress || null,
        activeNetworkId: res.activeNetworkId || 'desktop_connection'
      });
    });
    return true;
  }

  if (message.action === 'IMPORT_PRIVATE_KEY') {
    try {
      const wallet = new globalThis.ethers.Wallet(message.privateKey);
      const address = wallet.address;
      
      chrome.storage.local.get(['wallets'], (res) => {
        let wallets = res.wallets || [];
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

  if (message.action === 'DELETE_NETWORK') {
    chrome.storage.local.get(['customNetworks']).then(res => {
      let customNetworks = res.customNetworks || [];
      customNetworks = customNetworks.filter(n => n.id !== message.networkId);
      chrome.storage.local.set({ customNetworks }).then(() => {
        sendResponse({ success: true });
        chrome.storage.local.get(null).then(allState => {
          chrome.runtime.sendMessage({ action: 'STATE_UPDATED', state: allState }).catch(() => {});
        });
      });
    });
    return true;
  }

  if (message.action === 'SWITCH_ACCOUNT') {
    const address = message.address;
    const mode = message.mode;

    if (mode === 'standalone') {
      connectionMode = 'standalone';
      chrome.storage.local.set({ connectionMode: 'standalone', activeStandaloneAddress: address }).then(() => {
        sendResponse({ success: true });
      });
      return true;
    } else if (mode === 'desktop') {
      connectionMode = 'desktop';
      chrome.storage.local.set({ connectionMode: 'desktop' });
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: message.action, address: address }));
        sendResponse({ success: true });
      } else {
        connect();
        const onOpen = () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: message.action, address: address }));
          }
          if (socket) socket.removeEventListener('open', onOpen);
        };
        if (socket) socket.addEventListener('open', onOpen);
        sendResponse({ success: true });
      }
      return false;
    }
    return false;
  }

  if (message.action === 'GET_PENDING_REQ') {
    const data = approvalQueue.get(Number(message.reqId));
    if (data) {
      const { id, method, params, origin, tabId, wsPayload } = data;
      sendResponse({ success: true, data: { id, method, params, origin, tabId, wsPayload } });
    } else {
      sendResponse({ success: false });
    }
    return false;
  }

  if (message.action === 'DELETE_WALLET') {
    chrome.storage.local.get(['wallets', 'activeStandaloneAddress', 'connectionMode']).then(res => {
      let wallets = res.wallets || [];
      wallets = wallets.filter(w => w.address.toLowerCase() !== message.address.toLowerCase());
      
      const updates = { wallets };
      
      if (res.connectionMode === 'standalone' && res.activeStandaloneAddress && res.activeStandaloneAddress.toLowerCase() === message.address.toLowerCase()) {
        if (wallets.length > 0) {
          updates.activeStandaloneAddress = wallets[0].address;
          handleInternalMessage({ action: 'SWITCH_ACCOUNT', address: wallets[0].address, mode: 'standalone' }, sender, () => {});
        } else {
          updates.activeStandaloneAddress = null;
          updates.walletState = null;
        }
      }
      
      chrome.storage.local.set(updates).then(() => {
        sendResponse({ success: true });
        chrome.storage.local.get(null).then(allState => {
          chrome.runtime.sendMessage({ action: 'STATE_UPDATED', state: allState }).catch(() => {});
        });
      });
    });
    return true;
  }

  if (message.action === 'EXECUTE_SEND') {
    if (message.mode === 'standalone') {
      chrome.storage.local.get(['wallets', 'activeStandaloneAddress', 'customNetworks']).then(res => {
        const addr = res.activeStandaloneAddress;
        if (!addr) {
          sendResponse({ success: false, error: 'No active standalone address' });
          return;
        }
        const walletData = (res.wallets || []).find(w => w.address === addr);
        if (!walletData || !walletData.privateKey) {
          sendResponse({ success: false, error: 'Private key not found' });
          return;
        }
        const customNet = (res.customNetworks || []).find(n => n.id === message.networkId);
        if (!customNet) {
          sendResponse({ success: false, error: 'Custom network not found' });
          return;
        }
        let rpcUrl = customNet.rpcUrl;
        if (!rpcUrl.startsWith('http')) rpcUrl = 'http://' + rpcUrl;
        try {
          const provider = new globalThis.ethers.JsonRpcProvider(rpcUrl, parseInt(customNet.chainId, 10), { staticNetwork: true });
          const signer = new globalThis.ethers.Wallet(walletData.privateKey, provider);
          signer.sendTransaction({
            to: message.to,
            value: globalThis.ethers.parseEther(message.amount)
          }).then(tx => {
            sendResponse({ success: true, hash: tx.hash });
          }).catch(err => {
            console.error('Send error:', err);
            sendResponse({ success: false, error: err.message || 'Transaction failed' });
          });
        } catch (err) {
          sendResponse({ success: false, error: err.message || 'Failed to init provider' });
        }
      });
      return true;
    } else if (message.mode === 'desktop') {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        sendResponse({ success: false, error: 'Desktop wallet not connected' });
        return false;
      }
      const wsPayload = JSON.stringify({
        jsonrpc: JSON_RPC_VERSION,
        id: Date.now(),
        method: 'eth_sendTransaction',
        params: [{
          from: message.from,
          to: message.to,
          value: '0x' + globalThis.ethers.parseEther(message.amount).toString(16)
        }],
        __tabId: 'extension',
        origin: 'CointMU Extension'
      });
      socket.send(wsPayload);
      sendResponse({ success: true, pendingApproval: true });
      return false;
    }
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
      chrome.storage.local.get(['connectionMode', 'wallets', 'activeStandaloneAddress', 'customNetworks', 'activeNetworkId']).then(res => {
        if (res.connectionMode === 'standalone') {
          if (entry.method === 'eth_sendTransaction') {
            const txParams = entry.params[0];
            if (!txParams || !txParams.from || txParams.from.toLowerCase() !== res.activeStandaloneAddress.toLowerCase()) {
              pendingCallbacks.delete(key);
              entry.sendResponse({ result: null, error: { message: 'Sender address does not match active standalone address' } });
              return;
            }
            const walletData = (res.wallets || []).find(w => w.address.toLowerCase() === res.activeStandaloneAddress.toLowerCase());
            if (!walletData || !walletData.privateKey) {
              pendingCallbacks.delete(key);
              entry.sendResponse({ result: null, error: { message: 'Private key not found for active address' } });
              return;
            }
            const customNet = (res.customNetworks || []).find(n => n.id === res.activeNetworkId);
            if (!customNet) {
              pendingCallbacks.delete(key);
              entry.sendResponse({ result: null, error: { message: 'Active custom network not found' } });
              return;
            }
            let rpcUrl = customNet.rpcUrl;
            if (!rpcUrl.startsWith('http')) rpcUrl = 'http://' + rpcUrl;
            
            try {
              const provider = new globalThis.ethers.JsonRpcProvider(rpcUrl, parseInt(customNet.chainId, 10), { staticNetwork: true });
              const wallet = new globalThis.ethers.Wallet(walletData.privateKey, provider);
              wallet.sendTransaction({
                to: txParams.to,
                value: txParams.value,
                data: txParams.data,
                gasLimit: txParams.gas
              }).then(tx => {
                pendingCallbacks.delete(key);
                entry.sendResponse({ result: tx.hash, error: null });
              }).catch(err => {
                pendingCallbacks.delete(key);
                entry.sendResponse({ result: null, error: { message: err.message || 'Transaction execution failed' } });
              });
            } catch (err) {
              pendingCallbacks.delete(key);
              entry.sendResponse({ result: null, error: { message: err.message || 'Failed to initialize provider' } });
            }
          } else if (entry.method === 'eth_requestAccounts') {
            pendingCallbacks.delete(key);
            entry.sendResponse({ result: [res.activeStandaloneAddress], error: null });
          }
        } else {
          if (socket && socket.readyState === WebSocket.OPEN) {
            pendingCallbacks.set(key, entry.sendResponse);
            console.log('[CointMU-bg] Forwarding approved payload to Desktop', entry.wsPayload);
            socket.send(entry.wsPayload);
          } else {
            pendingCallbacks.delete(key);
            entry.sendResponse({ result: null, error: { message: 'WebSocket disconnected before execution.' } });
          }
        }
      });
    }
    sendResponse({ success: true });
    return false;
  }

  return false;
}
