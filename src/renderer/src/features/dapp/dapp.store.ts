import { create } from "zustand";

/**
 * Represents a single pending JSON-RPC request forwarded from the browser
 * extension to the Electron renderer for user approval.
 */
interface DappRequest {
  id: number;
  method: string;
  params: unknown[];
  tabId: number;
  origin: string;
}

/**
 * State and actions managed by the dApp approval store.
 */
interface DappStore {
  pendingDappRequest: DappRequest | null;
  setPendingDappRequest: (request: DappRequest) => void;
  clearPendingDappRequest: () => void;
}

/**
 * Global Zustand store that holds the single pending dApp JSON-RPC request
 * awaiting user approval. Only one request is held at a time; subsequent
 * requests overwrite the previous one. The store is intentionally ephemeral
 * and is not persisted to localStorage.
 */
export const useDappStore = create<DappStore>((set) => ({
  pendingDappRequest: null,

  /**
   * Stores an inbound dApp request and triggers the approval modal to appear.
   * @param {DappRequest} request - The JSON-RPC request payload from the extension.
   * @returns {void}
   */
  setPendingDappRequest: (request: DappRequest): void =>
    set({ pendingDappRequest: request }),

  /**
   * Clears the pending request after the user has approved or rejected it,
   * causing the approval modal to be dismissed.
   * @returns {void}
   */
  clearPendingDappRequest: (): void => set({ pendingDappRequest: null }),
}));

export type { DappRequest };
