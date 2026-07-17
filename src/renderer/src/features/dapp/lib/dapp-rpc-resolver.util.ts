import { call } from "@/shared/api/rpc.client";

/**
 * Resolves the correct JSON-RPC result value for a given method.
 * Methods that require on-chain data are forwarded to the local Core-geth node
 * via the shared RPC client. Account-discovery methods return the currently
 * active wallet address directly from React state so no round-trip is needed.
 * Unknown methods are forwarded to the node with their original parameters.
 * @param {string} method - The JSON-RPC method name.
 * @param {unknown[]} params - The original parameter array.
 * @param {string | null} activeAccount - The currently selected wallet address.
 * @returns {Promise<unknown>} The result value to send back in the JSON-RPC response.
 */
export async function resolveApprovalResult(
  method: string,
  params: unknown[],
  activeAccount: string | null,
): Promise<unknown> {
  switch (method) {
    case "eth_requestAccounts":
    case "eth_accounts": {
      return activeAccount ? [activeAccount] : [];
    }

    case "eth_chainId": {
      const chainId = await call("eth_chainId");
      return chainId ?? "0x1";
    }

    case "net_version": {
      const version = await call("net_version");
      return version ?? "1";
    }

    case "eth_getBalance": {
      const target =
        (params[0] as string | undefined) ?? activeAccount ?? "0x0";
      const tag = (params[1] as string | undefined) ?? "latest";
      const balance = await call("eth_getBalance", [target, tag]);
      return balance ?? "0x0";
    }

    case "eth_blockNumber": {
      const blockNumber = await call("eth_blockNumber");
      return blockNumber ?? "0x0";
    }

    case "eth_gasPrice": {
      const gasPrice = await call("eth_gasPrice");
      return gasPrice ?? "0x0";
    }

    case "eth_estimateGas": {
      const estimate = await call("eth_estimateGas", params);
      return estimate ?? "0x5208";
    }

    case "eth_sendTransaction": {
      return null;
    }

    default: {
      const result = await call(method, params);
      return result;
    }
  }
}
