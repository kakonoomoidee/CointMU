import { create } from 'zustand'
import {
  fetchBlockNumber,
  fetchPeerCount,
  fetchGasPrice,
  fetchMiningStatus,
  fetchHashrate,
  fetchDifficulty,
  fetchBalance
} from '@/services/rpcClient'

const DISCONNECTED_BALANCE = '0.00'

interface AppState {
  blockHeight: number | null
  peerCount: number | null
  gasPriceGwei: string | null
  isMining: boolean | null
  hashrate: number | null
  difficulty: number | null
  isConnected: boolean
  loading: boolean
  activeAccount: string | null
  balance: string
  balances: Record<string, string>
  setActiveAccount: (address: string | null) => void
  fetchGlobalStats: (address: string | null, addresses: string[]) => Promise<void>
}

/**
 * Builds the balances map for a set of addresses, mapping every address to the
 * disconnected placeholder. Used to keep the balances map shape stable while the
 * node is unreachable.
 * @param addresses - The wallet addresses currently tracked by the application.
 * @returns A record mapping each address to the disconnected balance string.
 */
function buildEmptyBalances(addresses: string[]): Record<string, string> {
  return addresses.reduce<Record<string, string>>((acc, addr) => {
    acc[addr] = DISCONNECTED_BALANCE
    return acc
  }, {})
}

/**
 * Single source of truth for all network and wallet data that is shared across
 * the Dashboard, Miner, Explorer, Wallet, and Settings views. A single polling
 * loop in the App orchestrator drives fetchGlobalStats, so every view renders
 * from the exact same snapshot and the per-view data drift described in Issue #8
 * is eliminated. Values are null while unknown or when the node is unreachable,
 * mirroring the disconnected semantics of the former per-view hooks.
 */
export const useAppStore = create<AppState>((set) => ({
  blockHeight: null,
  peerCount: null,
  gasPriceGwei: null,
  isMining: null,
  hashrate: null,
  difficulty: null,
  isConnected: false,
  loading: true,
  activeAccount: null,
  balance: DISCONNECTED_BALANCE,
  balances: {},
  setActiveAccount: (address: string | null) => set({ activeAccount: address }),
  fetchGlobalStats: async (address: string | null, addresses: string[]) => {
    try {
      const blockResult = await fetchBlockNumber()

      if (blockResult === null) {
        set({
          blockHeight: null,
          peerCount: null,
          gasPriceGwei: null,
          isMining: null,
          hashrate: null,
          difficulty: null,
          isConnected: false,
          loading: false,
          balance: DISCONNECTED_BALANCE,
          balances: buildEmptyBalances(addresses)
        })
        return
      }

      const [peers, gas, mining, hash, diff, singleBalance, balanceEntries] = await Promise.all([
        fetchPeerCount(),
        fetchGasPrice(),
        fetchMiningStatus(),
        fetchHashrate(),
        fetchDifficulty(),
        address !== null ? fetchBalance(address) : Promise.resolve(null),
        Promise.all(
          addresses.map(async (addr) => {
            const res = await fetchBalance(addr)
            return [addr, res !== null ? res : DISCONNECTED_BALANCE] as const
          })
        )
      ])

      const balances = balanceEntries.reduce<Record<string, string>>((acc, [addr, value]) => {
        acc[addr] = value
        return acc
      }, {})

      set({
        blockHeight: blockResult,
        peerCount: peers,
        gasPriceGwei: gas,
        isMining: mining,
        hashrate: hash,
        difficulty: diff,
        isConnected: true,
        loading: false,
        balance: singleBalance !== null ? singleBalance : DISCONNECTED_BALANCE,
        balances
      })
    } catch {
      set({
        blockHeight: null,
        peerCount: null,
        gasPriceGwei: null,
        isMining: null,
        hashrate: null,
        difficulty: null,
        isConnected: false,
        loading: false,
        balance: DISCONNECTED_BALANCE,
        balances: buildEmptyBalances(addresses)
      })
    }
  }
}))

export type { AppState }
