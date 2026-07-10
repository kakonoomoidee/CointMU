'use strict';

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

async function loadTranslations() {
  try {
    const response = await fetch('./locales/en.json');
    if (!response.ok) throw new Error('Failed to load translations');
    const json = await response.json();
    const translations = flattenObject(json);

    document.querySelectorAll('[id]').forEach((el) => {
      if (translations[el.id]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translations[el.id];
        } else {
          el.textContent = translations[el.id];
        }
      }
    });
    return translations;
  } catch (err) {
    console.error('Error loading translations:', err);
    return {};
  }
}

async function initPopup() {
  const translations = await loadTranslations();

  const loginView = document.getElementById('login-view');
  const selectionView = document.getElementById('selection-view');
  const defaultView = document.getElementById('default-view');
  const approvalView = document.getElementById('approval-view');
  const addNetworkView = document.getElementById('add-network-view');

  const privKeyInput = document.getElementById('priv-key-input');
  const importBtn = document.getElementById('import-btn');
  const cancelImportBtn = document.getElementById('cancel-import-btn');
  const selectImportBtn = document.getElementById('select-import-btn');
  const selectLinkBtn = document.getElementById('select-link-btn');
  const cancelSelectionBtn = document.getElementById('cancel-selection-btn');

  const balanceValue = document.getElementById('balance-value');
  const fiatValue = document.getElementById('fiat-value');
  const assetsList = document.getElementById('assets-list');
  const assetsCount = document.getElementById('assets-count');
  const connectedStatus = document.getElementById('connected-status');
  const statusText = document.getElementById('status-text');

  const accountSelect = document.getElementById('account-select');
  const networkSelect = document.getElementById('network-select');
  const addNetworkBtn = document.getElementById('add-network-btn');
  const saveNetworkBtn = document.getElementById('save-network-btn');
  const cancelNetworkBtn = document.getElementById('cancel-network-btn');

  const btnApproveConfirm = document.getElementById('btn-approve-confirm');
  const rejectTxBtn = document.getElementById('extension.wallet.rejectTx');

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const reqIdParam = urlParams.get('reqId');
  const reqId = reqIdParam ? parseInt(reqIdParam, 10) : null;

  if (mode === 'approve' && reqId) {
    loginView.classList.add('hidden');
    defaultView.classList.add('hidden');
    approvalView.classList.remove('hidden');

    chrome.runtime.sendMessage({ action: 'GET_PENDING_REQ', reqId }, (response) => {
      if (response && response.success && response.data) {
        const { method, params, origin } = response.data;
        document.getElementById('tx-to').textContent = origin || 'Unknown Origin';
        document.getElementById('tx-value').textContent = method === 'eth_requestAccounts' ? 'Connection Request' : (params[0]?.value || '0x0');
        document.getElementById('tx-data').textContent = method === 'eth_requestAccounts' ? 'Allow access to your wallet address' : (params[0]?.data || '0x');
      }
    });

    btnApproveConfirm.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'RESOLVE_REQ', reqId, approved: true }, () => window.close());
    });

    rejectTxBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'RESOLVE_REQ', reqId, approved: false }, () => window.close());
    });
    return;
  }

  const renderAssets = (balanceStr, symbol = 'CMU') => {
    assetsList.innerHTML = '';
    
    balanceValue.textContent = `${balanceStr} ${symbol}`;
    const balanceNum = parseFloat(balanceStr || '0');
    // We remove the fiat mock entirely, or just set it to -- if real data is requested
    fiatValue.textContent = `≈ $--`;

    const realAssets = [
      { symbol: symbol.charAt(0), name: symbol === 'CMU' ? 'CointMU' : symbol, bal: `${balanceStr || '0.00'} ${symbol}`, fiat: `--` }
    ];

    assetsCount.textContent = realAssets.length;

    realAssets.forEach(asset => {
      const item = document.createElement('div');
      item.className = 'asset-item';
      item.innerHTML = `
        <div class="asset-icon">${asset.symbol}</div>
        <div class="asset-info">
          <span class="asset-name">${asset.name}</span>
          <span class="asset-balance">${asset.bal}</span>
        </div>
        <div class="asset-fiat">${asset.fiat}</div>
      `;
      assetsList.appendChild(item);
    });
  };

  const formatAddress = (addr) => addr ? addr.substring(0, 6) + '...' + addr.substring(addr.length - 4) : '';

  const updateUI = async (res) => {
    // Populate Custom Networks
    const baseNetworks = [
      { id: 'cointmu', name: translations['extension.wallet.cointmuMainnet'] || 'CointMU Mainnet' },
      { id: 'cointmu_testnet', name: translations['extension.wallet.cointmuTestnet'] || 'CointMU Testnet' }
    ];
    networkSelect.innerHTML = '';
    [...baseNetworks, ...(res.customNetworks || [])].forEach(net => {
      const opt = document.createElement('option');
      opt.value = net.id;
      opt.textContent = net.name;
      if (res.activeNetworkId === net.id) opt.selected = true;
      networkSelect.appendChild(opt);
    });

    // Handle View Mode & Account Populate
    let currentAddress = null;
    
    // Always build unified dropdown
    accountSelect.innerHTML = '';
    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = translations['extension.wallet.selectAccount'] || 'Select Account';
    accountSelect.appendChild(placeholderOpt);

    let isStandaloneSelected = false;
    let isDesktopSelected = false;

    // Local standalone wallets
    (res.wallets || []).forEach(w => {
      const opt = document.createElement('option');
      opt.dataset.mode = 'standalone';
      opt.value = w.address;
      opt.textContent = `${formatAddress(w.address)} (${translations['extension.wallet.imported'] || 'Imported'})`;
      if (res.connectionMode === 'standalone' && w.address === res.activeStandaloneAddress) {
        opt.selected = true;
        currentAddress = w.address;
        isStandaloneSelected = true;
      }
      accountSelect.appendChild(opt);
    });

    // Desktop wallets
    if (res.isLinked && res.walletState && res.walletState.accounts) {
      res.walletState.accounts.forEach(acc => {
        const opt = document.createElement('option');
        opt.dataset.mode = 'desktop';
        opt.value = acc;
        opt.textContent = `${formatAddress(acc)} (${translations['extension.wallet.desktop'] || 'Desktop'})`;
        if (res.connectionMode === 'desktop' && res.walletState.address === acc) {
          opt.selected = true;
          currentAddress = acc;
          isDesktopSelected = true;
        }
        accountSelect.appendChild(opt);
      });
    }

    if (!currentAddress) {
      placeholderOpt.selected = true;
    }

    const addOpt = document.createElement('option');
    addOpt.value = 'add_wallet';
    addOpt.textContent = `+ ${translations['extension.wallet.addWallet'] || 'Add Wallet'}`;
    accountSelect.appendChild(addOpt);
    accountSelect.dataset.currentAddress = currentAddress || '';
    
    if (!currentAddress) {
      accountSelect.value = '';
    }

    // Adjust view layout and balances based on connection mode
    if (res.connectionMode === 'standalone') {
      loginView.classList.add('hidden');
      selectionView.classList.add('hidden');
      defaultView.classList.remove('hidden');
      addNetworkView.classList.add('hidden');
      
      connectedStatus.style.borderColor = 'var(--border-color)';
      statusText.textContent = translations['extension.wallet.standaloneMode'] || 'Standalone Mode';
    } else {
      if (res.isLinked) {
        loginView.classList.add('hidden');
        selectionView.classList.add('hidden');
        defaultView.classList.remove('hidden');
        addNetworkView.classList.add('hidden');
        
        if (res.isReconnecting) {
          connectedStatus.style.borderColor = 'var(--warning-color, orange)';
          statusText.textContent = translations['extension.wallet.reconnecting'] || 'Reconnecting...';
        } else {
          connectedStatus.style.borderColor = 'var(--border-color)';
          statusText.textContent = translations['extension.wallet.desktopMode'] || 'Connected to CointMU App';
        }
      } else {
        loginView.classList.add('hidden');
        selectionView.classList.remove('hidden');
        defaultView.classList.add('hidden');
        addNetworkView.classList.add('hidden');
      }
    }

    // Adaptive Asset Fetching
    const customNet = (res.customNetworks || []).find(n => n.id === res.activeNetworkId);
    if (customNet && currentAddress) {
      renderAssets('--', 'ETH');
      try {
        const provider = new ethers.JsonRpcProvider(customNet.rpcUrl);
        const bal = await provider.getBalance(currentAddress);
        renderAssets(ethers.formatEther(bal), 'ETH');
      } catch (err) {
        console.error('Failed to fetch from custom RPC', err);
        renderAssets('0.00', 'ERR');
      }
    } else if (res.connectionMode === 'desktop' && res.walletState) {
      renderAssets(res.walletState.balance, 'CMU');
    } else {
      renderAssets('0.00', 'CMU');
    }
  };

  chrome.runtime.sendMessage({ action: 'GET_CURRENT_STATE' }, (res) => {
    if (res) {
      updateUI(res);
      if (res.isLinked && res.connectionMode === 'desktop') {
        chrome.runtime.sendMessage({ action: 'AUTO_RECONNECT' });
      }
    }
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      chrome.runtime.sendMessage({ action: 'GET_CURRENT_STATE' }, (res) => {
        if (res) updateUI(res);
      });
    }
  });

  importBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const pk = privKeyInput.value.trim();
    if (!pk) return;
    chrome.runtime.sendMessage({ action: 'IMPORT_PRIVATE_KEY', privateKey: pk }, (res) => {
      if (res && res.success) {
        privKeyInput.value = '';
        loginView.classList.add('hidden');
        defaultView.classList.remove('hidden');
        
        // Force a re-render of the UI to show new wallet
        chrome.runtime.sendMessage({ action: 'GET_CURRENT_STATE' }, (newState) => {
          if (newState) updateUI(newState);
        });
      } else {
        alert(translations['extension.wallet.importFailed'] || 'Failed to import key');
      }
    });
  });

  cancelImportBtn.addEventListener('click', () => {
    loginView.classList.add('hidden');
    defaultView.classList.remove('hidden');
  });

  selectImportBtn.addEventListener('click', () => {
    console.log('[DEBUG] select-import-btn clicked');
    selectionView.classList.add('hidden');
    loginView.classList.remove('hidden');
  });

  selectLinkBtn.addEventListener('click', () => {
    console.log('[DEBUG] select-link-btn clicked');
    chrome.runtime.sendMessage({ action: 'REQUEST_LINK' });
    selectLinkBtn.querySelector('span').textContent = translations['extension.wallet.waitingApproval'] || 'Waiting for approval...';
  });

  cancelSelectionBtn.addEventListener('click', () => {
    console.log('[DEBUG] cancel-selection-btn clicked');
    selectionView.classList.add('hidden');
    defaultView.classList.remove('hidden');
  });

  accountSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === '') return;
    
    if (val === 'add_wallet') {
      defaultView.classList.add('hidden');
      selectionView.classList.remove('hidden');
      
      // Reset dropdown value immediately to prevent it from getting stuck on 'add_wallet'
      const prevAddr = e.target.dataset.currentAddress;
      e.target.value = prevAddr || '';
    } else {
      const selectedOpt = e.target.options[e.target.selectedIndex];
      const mode = selectedOpt.dataset.mode;
      chrome.runtime.sendMessage({ action: 'SWITCH_ACCOUNT', address: val, mode });
    }
  });

  networkSelect.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({ action: 'SWITCH_NETWORK', networkId: e.target.value });
  });

  addNetworkBtn.addEventListener('click', () => {
    defaultView.classList.add('hidden');
    addNetworkView.classList.remove('hidden');
  });

  cancelNetworkBtn.addEventListener('click', () => {
    addNetworkView.classList.add('hidden');
    defaultView.classList.remove('hidden');
  });

  saveNetworkBtn.addEventListener('click', () => {
    const name = document.getElementById('network-name-input').value.trim();
    const rpcUrl = document.getElementById('rpc-url-input').value.trim();
    const chainId = document.getElementById('chain-id-input').value.trim();
    if (!name || !rpcUrl) {
      alert('Name and RPC URL are required');
      return;
    }
    chrome.runtime.sendMessage({ action: 'ADD_CUSTOM_NETWORK', name, rpcUrl, chainId }, (res) => {
      if (res && res.success) {
        document.getElementById('network-name-input').value = '';
        document.getElementById('rpc-url-input').value = '';
        document.getElementById('chain-id-input').value = '';
        addNetworkView.classList.add('hidden');
        defaultView.classList.remove('hidden');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initPopup);
