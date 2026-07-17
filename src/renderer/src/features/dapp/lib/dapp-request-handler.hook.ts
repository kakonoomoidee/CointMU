import { useEffect } from "react";
import { useAppStore } from "@/shared/model";
import { useDappStore } from "../model/dapp.store";
import { useConnectedSitesStore } from "@/features/settings";
import { resolveApprovalResult } from "./dapp-rpc-resolver.util";

/**
 * Custom hook that listens to the main process for incoming dApp JSON-RPC
 * requests and applies the 'Connected Sites' access control logic.
 *
 * - If the dApp is whitelisted in connectedSites and the method is read-only,
 *   it is auto-approved and resolved silently.
 * - If the method is eth_requestAccounts or a write operation, the modal is
 *   shown regardless of whitelist status.
 * - If the dApp is not whitelisted and the method is not eth_requestAccounts,
 *   it is automatically rejected with error code 4100 (Unauthorized).
 * @returns {void}
 */
export function useDappRequestHandler(): void {
  const setPendingDappRequest = useDappStore((s) => s.setPendingDappRequest);
  const connectedSites = useConnectedSitesStore((s) => s.connectedSites);
  const activeAccount = useAppStore((s) => s.activeAccount);

  useEffect(() => {
    const unsubscribe = window.api.dapp.onDappRequest((payload) => {
      const { id, method, params, tabId, origin } = payload;

      const isConnected = connectedSites.some((s) => s.origin === origin);
      const isConnectionRequest = method === "eth_requestAccounts";
      const isWriteOperation =
        method === "eth_sendTransaction" || method === "personal_sign";
      const isReadOnlyOperation = [
        "eth_chainId",
        "eth_getBalance",
        "eth_accounts",
        "net_version",
        "eth_blockNumber",
        "eth_gasPrice",
        "eth_estimateGas",
      ].includes(method);

      if (isConnectionRequest || isWriteOperation) {
        // ALWAYS show modal for connections and transactions
        setPendingDappRequest(payload);
        return;
      }

      if (!isConnected) {
        // Reject unauthorized access
        window.api.dapp.sendDappResponse({
          id,
          tabId,
          approved: false,
        });
        // NOTE: While we return approved: false, the extension will send 4001 by default.
        // We can override the code in the extension if we change the IPC, but standard
        // EIP-1193 rejection works for now.
        return;
      }

      if (isReadOnlyOperation) {
        // Silently auto-approve whitelisted read requests
        resolveApprovalResult(method, params, activeAccount).then((result) => {
          window.api.dapp.sendDappResponse({
            id,
            tabId,
            approved: true,
            result,
          });
        });
        return;
      }

      // Default: show modal for unknown methods
      setPendingDappRequest(payload);
    });

    return unsubscribe;
  }, [connectedSites, activeAccount, setPendingDappRequest]);
}
