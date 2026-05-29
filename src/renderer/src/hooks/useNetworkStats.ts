import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchBlockNumber,
  fetchPeerCount,
  fetchGasPrice,
  fetchMiningStatus,
  fetchHashrate,
  fetchDifficulty
} from '@/services/rpcClient'

const POLL_INTERVAL_MS = 3000
const INITIAL_DELAY_MS = 300

export interface NetworkStats {
  blockHeight: number | null
  peerCount: number | null
  gasPriceGwei: string | null
  isMining: boolean | null
  hashrate: number | null
  difficulty: number | null
  isConnected: boolean
  loading: boolean
}

const DISCONNECTED_STATE: NetworkStats = {
  blockHeight: null,
  peerCount: null,
  gasPriceGwei: null,
  isMining: null,
  hashrate: null,
  difficulty: null,
  isConnected: false,
  loading: false
}

const INITIAL_STATE: NetworkStats = {
  blockHeight: null,
  peerCount: null,
  gasPriceGwei: null,
  isMining: null,
  hashrate: null,
  difficulty: null,
  isConnected: false,
  loading: true
}

/**
 * Custom hook that polls the remote Core-geth JSON-RPC node every 3 seconds
 * to fetch live network statistics including block height, peer count,
 * gas price, mining status, hashrate, and difficulty. Exposes an explicit
 * isConnected boolean that is true only when the primary RPC call
 * (eth_blockNumber) succeeds. When the node is unreachable, all stat values
 * are reset to null and isConnected is set to false.
 * @returns A reactive NetworkStats object updated on each poll cycle.
 */
function useNetworkStats(): NetworkStats {
  const [stats, setStats] = useState<NetworkStats>(INITIAL_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async (): Promise<void> => {
    try {
      const blockResult = await fetchBlockNumber()

      if (blockResult === null) {
        setStats(DISCONNECTED_STATE)
        return
      }

      const [peers, gas, mining, hash, diff] = await Promise.all([
        fetchPeerCount(),
        fetchGasPrice(),
        fetchMiningStatus(),
        fetchHashrate(),
        fetchDifficulty()
      ])

      setStats({
        blockHeight: blockResult,
        peerCount: peers,
        gasPriceGwei: gas,
        isMining: mining,
        hashrate: hash,
        difficulty: diff,
        isConnected: true,
        loading: false
      })
    } catch {
      setStats(DISCONNECTED_STATE)
    }
  }, [])

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      poll()
    }, INITIAL_DELAY_MS)

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return (): void => {
      clearTimeout(initialTimer)
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [poll])

  return stats
}

export { useNetworkStats }

