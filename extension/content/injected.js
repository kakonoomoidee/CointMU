"use strict";

(function () {
  const PROVIDER_MESSAGE_SOURCE = "cointmu-injected";
  const PAGE_MESSAGE_SOURCE = "cointmu-page";

  let nextRequestId = 1;

  /**
   * Holds the resolver and rejecter for a pending JSON-RPC request so that the
   * response routed back from the Electron app can settle the correct Promise.
   * @typedef {Object} PendingEntry
   * @property {Function} resolve - Settles the promise with the RPC result.
   * @property {Function} reject  - Rejects the promise with an error object.
   */

  /** @type {Map<number, {resolve: Function, reject: Function}>} */
  const pending = new Map();

  /**
   * Handles incoming messages from the content script layer. Messages must carry
   * the cointmu-injected source tag and a valid id field that maps to a pending
   * request. On receipt the corresponding promise is settled and the entry removed.
   * @param {MessageEvent} event - The message event dispatched on the window.
   * @returns {void}
   */
  function handleResponse(event) {
    if (!event.data) return;

    if (
      event.data.source === PROVIDER_MESSAGE_SOURCE &&
      event.data.type === "COINTMU_REVOKE_SITE"
    ) {
      provider.selectedAddress = null;
      if (provider._listeners && provider._listeners["accountsChanged"]) {
        provider._listeners["accountsChanged"].forEach(function (listener) {
          try {
            listener([]);
          } catch (e) {
            console.error("Error executing accountsChanged listener", e);
          }
        });
      }
      return;
    }

    if (
      event.data.source === PROVIDER_MESSAGE_SOURCE &&
      event.data.type === "COINTMU_ACCOUNTS_CHANGED"
    ) {
      const accounts = Array.isArray(event.data.accounts)
        ? event.data.accounts
        : [];
      provider.selectedAddress = accounts[0] || null;
      if (provider._listeners && provider._listeners["accountsChanged"]) {
        provider._listeners["accountsChanged"].forEach(function (listener) {
          try {
            listener(accounts);
          } catch (e) {
            console.error("Error executing accountsChanged listener", e);
          }
        });
      }
      return;
    }

    if (event.data.source !== PROVIDER_MESSAGE_SOURCE) return;
    const { id, result, error } = event.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    if (error) {
      entry.reject(new Error(error.message || "RPC error"));
    } else {
      entry.resolve(result);
    }
  }

  window.addEventListener("message", handleResponse);

  /**
   * The EIP-1193 compliant provider object injected into window.ethereum.
   * All dApp calls are forwarded to the CointMU desktop wallet via postMessage
   * to the content script, which relays them over the background WebSocket.
   * No private keys or account state are held in this object.
   */
  const provider = {
    isMetaMask: false,
    isCointMU: true,
    chainId: null,
    selectedAddress: null,

    /**
     * Forwards a JSON-RPC request to the content script and returns a promise
     * that resolves or rejects once the Electron desktop wallet responds.
     * @param {{ method: string, params?: unknown[] }} args - The JSON-RPC request arguments.
     * @returns {Promise<unknown>} A promise resolving to the JSON-RPC result.
     */
    request(args) {
      return new Promise(function (resolve, reject) {
        const id = nextRequestId++;
        pending.set(id, { resolve, reject });
        window.postMessage(
          {
            source: PAGE_MESSAGE_SOURCE,
            id,
            method: args.method,
            params: args.params || [],
          },
          "*",
        );
      });
    },

    /**
     * Legacy send interface maintained for compatibility with older dApps.
     * Delegates to the request method using the standard EIP-1193 shape.
     * @param {string} method - The JSON-RPC method name.
     * @param {unknown[]} params - The positional parameters for the method.
     * @returns {Promise<unknown>} A promise resolving to the JSON-RPC result.
     */
    send(method, params) {
      return this.request({ method, params });
    },

    /**
     * Legacy sendAsync interface maintained for compatibility with older dApps.
     * Delegates to the request method and adapts the result into a callback pattern.
     * @param {{ method: string, params: unknown[], id: number }} payload - The JSON-RPC request payload.
     * @param {Function} callback - Node-style callback receiving (error, response).
     * @returns {void}
     */
    sendAsync(payload, callback) {
      this.request({ method: payload.method, params: payload.params })
        .then(function (result) {
          callback(null, { id: payload.id, jsonrpc: "2.0", result });
        })
        .catch(function (err) {
          callback(err, null);
        });
    },

    /** @type {Record<string, Function[]>} */
    _listeners: {},

    /**
     * @param {string} eventName - The event name to subscribe to.
     * @param {Function} listener - The listener function.
     * @returns {typeof provider} The provider object for chaining.
     */
    on(eventName, listener) {
      if (!this._listeners[eventName]) {
        this._listeners[eventName] = [];
      }
      this._listeners[eventName].push(listener);
      return this;
    },

    /**
     * @param {string} eventName - The event name to unsubscribe from.
     * @param {Function} listener - The listener to remove.
     * @returns {typeof provider} The provider object for chaining.
     */
    removeListener(eventName, listener) {
      if (this._listeners[eventName]) {
        this._listeners[eventName] = this._listeners[eventName].filter(
          function (l) {
            return l !== listener;
          },
        );
      }
      return this;
    },

    /**
     * @param {string} eventName - The event to emit.
     * @param {unknown} payload - The event payload.
     * @returns {void}
     */
    emit(eventName, payload) {
      if (this._listeners[eventName]) {
        this._listeners[eventName].forEach(function (listener) {
          try {
            listener(payload);
          } catch (e) {
            console.error("Error in event listener", e);
          }
        });
      }
    },
  };

  Object.defineProperty(window, "ethereum", {
    value: provider,
    writable: false,
    configurable: false,
  });

  window.dispatchEvent(new Event("ethereum#initialized"));
})();
