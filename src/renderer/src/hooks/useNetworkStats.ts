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
 * Custom hook that polls the local Core-geth JSON-RPC node every 3 seconds
 * to fetch live network statistics. Exposes an explicit isConnected boolean
 * that is true only when the primary RPC call (eth_blockNumber) succeeds.
 * When the node is unreachable, all stat values are reset to null and
 * isConnected is set to false.
 * @param port - The dynamically resolved RPC port. Polling begins only when non-null.
 * @returns A reactive NetworkStats object updated on each poll cycle.
 */
function useNetworkStats(port: number | null): NetworkStats {
  const [stats, setStats] = useState<NetworkStats>(INITIAL_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async (): Promise<void> => {
    if (port === null) {
      setStats(DISCONNECTED_STATE)
      return
    }

    try {
      const blockResult = await fetchBlockNumber(port)

      if (blockResult === null) {
        setStats(DISCONNECTED_STATE)
        return
      }

      const [peers, gas, mining, hash, diff] = await Promise.all([
        fetchPeerCount(port),
        fetchGasPrice(port),
        fetchMiningStatus(port),
        fetchHashrate(port),
        fetchDifficulty(port)
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
  }, [port])

  useEffect(() => {
    if (port === null) {
      setStats(DISCONNECTED_STATE)
      return
    }

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
  }, [port, poll])

  return stats
}

export { useNetworkStats }
