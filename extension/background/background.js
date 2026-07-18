'use strict';

import '../lib/ethers.umd.min.js';
import { handleContentMessage, handleInternalMessage, connectionMode } from '../shared/wallet.js';
import { connect } from '../shared/socket.js';

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
