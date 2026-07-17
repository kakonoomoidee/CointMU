import { WebSocketServer, type WebSocket } from "ws";
import { callGethRpc } from "../utils/rpcUtils";
import { ipcMain, BrowserWindow } from "electron";

const EXTENSION_SYNC_PORT = process.env.ELECTRON_WS_PORT
  ? parseInt(process.env.ELECTRON_WS_PORT)
  : 8765;
let wss: WebSocketServer | null = null;
let pendingSocket: WebSocket | null = null;

/**
 * Fetches the latest balance for the active wallet and broadcasts the full
 * state payload to all connected extension UI clients.
 * @param {any} store - The electron-store instance containing wallet settings.
 * @param {number} rpcPort - The current local Geth RPC port.
 * @returns {Promise<void>}
 */
export async function broadcastWalletState(
  store: any,
  rpcPort: number,
): Promise<void> {
  if (!wss) return;

  const address = store.get("activeWalletAddress");
  const network = store.get("network.network") || "CointMU Mainnet";
  let balance = "0.00";

  let accounts: string[] = [];

  if (address) {
    try {
      const balanceHex = await callGethRpc(rpcPort, "eth_getBalance", [
        address,
        "latest",
      ]);
      if (typeof balanceHex === "string" && balanceHex.startsWith("0x")) {
        const wei = BigInt(balanceHex);
        const eth = Number(wei) / 1e18;
        balance = eth.toFixed(4);
      }
    } catch (err) {
      console.error("[extension-sync] Failed to fetch balance:", err);
    }
  }

  try {
    const storedAccounts = store.get("accounts") || [];
    accounts = storedAccounts
      .filter((a: any) => !a.isHidden)
      .map((a: any) => a.address);
  } catch (err) {
    console.error("[extension-sync] Failed to fetch accounts from store:", err);
  }

  const payload = JSON.stringify({
    type: "WALLET_STATE",
    address,
    accounts,
    balance,
    network,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

/**
 * Initializes the WebSocket server dedicated to syncing wallet state down to
 * the companion browser extension popup UI.
 * @param {any} store - The electron-store instance.
 * @param {number} rpcPort - The current local Geth RPC port.
 * @param {BrowserWindow} win - The main electron window for IPC.
 * @returns {{ close: () => void }} An object containing the close method for cleanup.
 */
export function startExtensionSyncServer(
  store: any,
  rpcPort: number,
  win: BrowserWindow,
): { close: () => void } {
  wss = new WebSocketServer({ host: "127.0.0.1", port: EXTENSION_SYNC_PORT });

  ipcMain.on("pairing:respond", (_, approved: boolean) => {
    if (pendingSocket && pendingSocket.readyState === 1) {
      if (approved) {
        pendingSocket.send(JSON.stringify({ type: "LINK_APPROVED" }));
        store.set("isExtensionLinked", true);
        win.webContents.send("extension:linked");
        void broadcastWalletState(store, rpcPort);
      } else {
        pendingSocket.send(JSON.stringify({ type: "LINK_REJECTED" }));
      }
    }
    pendingSocket = null;
  });

  ipcMain.on("extension:unlink", () => {
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "FORCE_UNLINK" }));
        }
      });
    }
    store.set("isExtensionLinked", false);
  });

  ipcMain.on("dapp:revokeSite", (_, origin: string) => {
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "REVOKE_SITE", origin }));
        }
      });
    }
  });

  wss.on("listening", () => {
    console.log(`[Extension-Bridge] Listening on port ${EXTENSION_SYNC_PORT}`);
  });

  wss.on("connection", (socket: WebSocket) => {
    console.log("[extension-sync] Extension UI connected.");
    BrowserWindow.getAllWindows()[0]?.webContents.send(
      "dapp:extensionStatus",
      true,
    );

    socket.on("message", async (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "REQUEST_LINK") {
          pendingSocket = socket;
          win.webContents.send("pairing:request");
        } else if (msg.type === "ping") {
          socket.send(JSON.stringify({ type: "pong" }));
        } else if (msg.type === "AUTO_RECONNECT") {
          void broadcastWalletState(store, rpcPort);
        } else if (msg.type === "GET_ACCOUNTS") {
          let accounts: string[] = [];
          try {
            const storedAccounts = store.get("accounts") || [];
            accounts = storedAccounts
              .filter((a: any) => !a.isHidden)
              .map((a: any) => a.address);
          } catch (err) {
            console.error(
              "[extension-sync] Failed to fetch accounts from store:",
              err,
            );
          }
          const activeAccount =
            store.get("activeWalletAddress") || accounts[0] || "";
          socket.send(
            JSON.stringify({ type: "ACCOUNTS_LIST", accounts, activeAccount }),
          );
        } else if (msg.type === "SWITCH_ACCOUNT") {
          store.set("activeWalletAddress", msg.address);
          void broadcastWalletState(store, rpcPort);
          if (wss) {
            wss.clients.forEach((client) => {
              if (client.readyState === 1) {
                client.send(
                  JSON.stringify({
                    type: "ACCOUNTS_CHANGED",
                    accounts: [msg.address],
                  }),
                );
              }
            });
          }
        } else if (msg.jsonrpc === "2.0") {
          try {
            const parsedPayload = msg;

            if (
              parsedPayload.method === "eth_requestAccounts" ||
              parsedPayload.method === "eth_accounts"
            ) {
              let walletAddress = "0x0000000000000000000000000000000000000000";
              try {
                const storedAddress = store.get("activeWalletAddress");
                if (storedAddress) walletAddress = storedAddress;
              } catch (e) {
                console.error(
                  "[WS Server Error] Failed to fetch activeWalletAddress:",
                  e,
                );
              }

              if (parsedPayload.method === "eth_requestAccounts") {
                BrowserWindow.getAllWindows()[0]?.webContents.send(
                  "dapp:siteConnected",
                  parsedPayload.origin,
                );
              }

              const response = JSON.stringify({
                jsonrpc: "2.0",
                id: parsedPayload.id,
                result: [walletAddress],
                __tabId: parsedPayload.__tabId,
              });
              socket.send(response);
            } else {
              try {
                const result = await callGethRpc(
                  rpcPort,
                  parsedPayload.method,
                  parsedPayload.params,
                );
                socket.send(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id: parsedPayload.id,
                    __tabId: parsedPayload.__tabId,
                    result,
                  }),
                );
              } catch (err: any) {
                socket.send(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id: parsedPayload.id,
                    __tabId: parsedPayload.__tabId,
                    error: { code: -32603, message: err.message },
                  }),
                );
              }
            }
          } catch (error) {
            console.error("[WS Server Error]:", error);
          }
        }
      } catch (err) {
        console.error("[extension-sync] Failed to parse message:", err);
      }
    });

    socket.on("close", () => {
      console.log("[extension-sync] Extension UI disconnected.");
      if (pendingSocket === socket) {
        pendingSocket = null;
      }
      if (wss && wss.clients.size === 0) {
        BrowserWindow.getAllWindows()[0]?.webContents.send(
          "dapp:extensionStatus",
          false,
        );
      }
    });

    socket.on("error", (err: Error) => {
      console.error("[extension-sync] Socket error:", err.message);
      if (wss && wss.clients.size === 0) {
        BrowserWindow.getAllWindows()[0]?.webContents.send(
          "dapp:extensionStatus",
          false,
        );
      }
    });
  });

  wss.on("error", (err: Error) => {
    console.error("[extension-sync] Server error:", err.message);
  });

  return {
    close(): void {
      if (wss) {
        wss.close();
        wss = null;
      }
      ipcMain.removeAllListeners("pairing:respond");
      ipcMain.removeAllListeners("extension:unlink");
      ipcMain.removeAllListeners("dapp:revokeSite");
    },
  };
}
