'use strict';

/**
 * Flattens a nested object into a single-level object with dot-separated keys.
 * @param {Object} obj - The nested object to flatten.
 * @param {string} [prefix=''] - The current key prefix.
 * @returns {Object} The flattened object.
 */
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

/**
 * Loads translations from the local en.json and applies them to the DOM.
 * Elements with an ID matching a translation key will have their text content updated.
 * @returns {Promise<void>}
 */
async function loadTranslations() {
  try {
    const response = await fetch('./locales/en.json');
    if (!response.ok) throw new Error('Failed to load translations');
    const json = await response.json();
    const translations = flattenObject(json);

    document.querySelectorAll('[id]').forEach((el) => {
      if (translations[el.id]) {
        el.textContent = translations[el.id];
      }
    });
  } catch (err) {
    console.error('Error loading translations:', err);
  }
}

/**
 * Initializes the popup view, sets up event listeners, and attempts a WebSocket connection.
 * @returns {Promise<void>}
 */
async function initPopup() {
  await loadTranslations();

  const networkSelect = document.getElementById('network-select');
  const balanceValue = document.getElementById('balance-value');
  const btnApproveConfirm = document.getElementById('btn-approve-confirm');
  const rejectTxBtn = document.getElementById('extension.wallet.rejectTx');
  
  const linkAppBtn = document.getElementById('linkAppBtn');
  const connectedStatus = document.getElementById('connected-status');
  
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const reqIdParam = urlParams.get('reqId');
  const reqId = reqIdParam ? parseInt(reqIdParam, 10) : null;

  if (mode === 'approve' && reqId) {
    document.getElementById('default-view').classList.remove('active');
    document.getElementById('default-view').classList.add('hidden');
    document.getElementById('approval-view').classList.remove('hidden');
    document.getElementById('approval-view').classList.add('active');

    chrome.runtime.sendMessage({ action: 'GET_PENDING_REQ', reqId }, (response) => {
      if (response && response.success && response.data) {
        const { method, params, origin } = response.data;
        const txTo = document.getElementById('tx-to');
        const txValue = document.getElementById('tx-value');
        const txData = document.getElementById('tx-data');

        if (method === 'eth_requestAccounts') {
          txTo.textContent = origin || 'Unknown Origin';
          txValue.textContent = 'Connection Request';
          txData.textContent = 'Allow access to your wallet address';
        } else if (method === 'eth_sendTransaction' && params && params[0]) {
          txTo.textContent = params[0].to || 'Contract Creation';
          txValue.textContent = params[0].value || '0x0';
          txData.textContent = params[0].data || '0x';
        }
      }
    });

    btnApproveConfirm.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'RESOLVE_REQ', reqId, approved: true }, () => {
        window.close();
      });
    });

    rejectTxBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'RESOLVE_REQ', reqId, approved: false }, () => {
        window.close();
      });
    });
    return;
  }

  if (linkAppBtn) {
    const result = await chrome.storage.local.get(['isLinked', 'walletState']);
    const isLinked = result.isLinked === true;
    const walletState = result.walletState;

    const updateUI = (linked, state) => {
      if (linked) {
        linkAppBtn.classList.add('hidden');
        if (connectedStatus) {
          connectedStatus.classList.remove('hidden');
          connectedStatus.style.color = '#10b981'; // Green for success
          fetch('./locales/en.json')
            .then(res => res.json())
            .then(json => {
              const flat = flattenObject(json);
              connectedStatus.textContent = flat['extension.wallet.connected'] || 'Connected to CointMU';
            });
        }
        if (state && state.balance !== undefined && balanceValue) {
          balanceValue.textContent = `${state.balance} CMU`;
        }
      } else {
        linkAppBtn.classList.remove('hidden');
        if (connectedStatus) {
          connectedStatus.classList.add('hidden');
        }
        const span = linkAppBtn.querySelector('span');
        if (span) {
          fetch('./locales/en.json')
            .then(res => res.json())
            .then(json => {
              const flat = flattenObject(json);
              span.textContent = flat['extension.wallet.linkToApp'] || 'Link to CointMU App';
            });
        }
      }
    };

    updateUI(isLinked, walletState);

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        chrome.storage.local.get(['isLinked', 'walletState']).then(res => {
          updateUI(res.isLinked === true, res.walletState);
        });
      }
    });

    linkAppBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'REQUEST_LINK' });
      fetch('./locales/en.json')
        .then(res => res.json())
        .then(json => {
          const flat = flattenObject(json);
          const span = linkAppBtn.querySelector('span');
          if (span) {
            span.textContent = flat['extension.wallet.waitingApproval'] || 'Waiting for approval in Desktop App...';
          }
        });
    });

    if (isLinked) {
      chrome.runtime.sendMessage({ action: 'AUTO_RECONNECT' });
    }
  }

  networkSelect.addEventListener('change', (e) => {
    console.log('Network switched to:', e.target.value);
  });
}

document.addEventListener('DOMContentLoaded', initPopup);
