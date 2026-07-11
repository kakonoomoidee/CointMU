'use strict';

import './ethers.umd.min.js';
import { handleContentMessage, handleInternalMessage, connectionMode } from './wallet.js';
import { connect } from './socket.js';

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
