'use strict';

const PAGE_MESSAGE_SOURCE = 'cointmu-page';
const INJECTED_MESSAGE_SOURCE = 'cointmu-injected';

/**
 * Injects the injected.js provider script into the page's MAIN world by
 * appending a <script> tag to document.head or document.documentElement.
 * The src is resolved via chrome.runtime.getURL so the file is loaded from
 * the extension bundle and is trusted by the browser. The element is removed
 * from the DOM immediately after it loads to keep the page tree clean.
 * @returns {void}
 */
function injectProvider() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.type = 'text/javascript';

  script.addEventListener('load', function () {
    script.remove();
  });

  (document.head || document.documentElement).appendChild(script);
}

/**
 * Listens for EIP-1193 JSON-RPC request messages posted by the injected
 * provider script running in the MAIN world and relays them to the background
 * service worker via chrome.runtime.sendMessage. Responses from the background
 * script are forwarded back to the page via postMessage so the injected
 * provider can settle the correct pending promise.
 * @param {MessageEvent} event - The message event posted by the injected provider.
 * @returns {void}
 */
function handlePageMessage(event) {
  if (!event.data || event.data.source !== PAGE_MESSAGE_SOURCE) return;

  const { id, method, params } = event.data;

  try {
    chrome.runtime.sendMessage(
      { id, method, params, origin: window.location.origin },
      function (response) {
        if (chrome.runtime.lastError) {
          window.postMessage(
            {
              source: INJECTED_MESSAGE_SOURCE,
              id,
              error: { message: chrome.runtime.lastError.message || 'Extension relay error' }
            },
            '*'
          );
          return;
        }

        window.postMessage(
          {
            source: INJECTED_MESSAGE_SOURCE,
            id,
            result: response.result,
            error: response.error || null
          },
          '*'
        );
      }
    );
  } catch (err) {
    if (err.message && err.message.includes('Extension context invalidated')) {
      window.postMessage(
        {
          source: INJECTED_MESSAGE_SOURCE,
          id,
          error: { message: 'Extension context invalidated. Please refresh the page.' }
        },
        '*'
      );
    } else {
      window.postMessage(
        {
          source: INJECTED_MESSAGE_SOURCE,
          id,
          error: { message: err.message || 'Unknown extension error' }
        },
        '*'
      );
    }
  }
}

injectProvider();

window.addEventListener('message', handlePageMessage);

chrome.runtime.onMessage.addListener((message) => {
  if (message && message.type === 'REVOKE_SITE') {
    window.postMessage({ type: 'COINTMU_REVOKE_SITE', source: INJECTED_MESSAGE_SOURCE }, '*');
  } else if (message && message.type === 'ACCOUNTS_CHANGED') {
    window.postMessage({ type: 'COINTMU_ACCOUNTS_CHANGED', accounts: message.accounts, source: INJECTED_MESSAGE_SOURCE }, '*');
  }
});
