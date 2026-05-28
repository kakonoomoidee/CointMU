import { useState, useEffect, useCallback, useRef } from 'react'
import { createProvider, getBlockNumber, getChainId, getPeerCount, getSyncStatus } from '@/services'

const NETWORK_POLL_INTERVAL_MS = 5000
const INITIAL_FETCH_DELAY_MS = 500

interface NetworkStatus {
  blockNumber: number | null
  chainId: bigint | null
  peerCount: number | null
  syncing: boolean | Record<string, string> | null
  connected: boolean
  lastUpdated: number | null
}

const INITIAL_NETWORK_STATUS: NetworkStatus = {
  blockNumber: null,
  chainId: null,
  peerCount: null,
  syncing: null,
  connected: false,
  lastUpdated: null
}

/**
 * Polling hook that periodically fetches network status (block number, chain ID,
 * peer count, sync state) from the local node via the web3 service layer.
 * @param port - The RPC port to connect to. Polling begins only when port is available.
 * @returns The current network status object.
 */
function useNetworkStatus(port: number | null): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(INITIAL_NETWORK_STATUS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async (): Promise<void> => {
    if (port === null) {
      return
    }

    const provider = createProvider(port)

    try {
      const [blockResult, chainResult, peerResult, syncResult] = await Promise.allSettled([
        getBlockNumber(provider),
        getChainId(provider),
        getPeerCount(provider),
        getSyncStatus(provider)
      ])

      setStatus({
        blockNumber: blockResult.status === 'fulfilled' ? blockResult.value : null,
        chainId: chainResult.status === 'fulfilled' ? chainResult.value : null,
        peerCount: peerResult.status === 'fulfilled' ? peerResult.value : null,
        syncing: syncResult.status === 'fulfilled' ? syncResult.value : null,
        connected: blockResult.status === 'fulfilled' && blockResult.value !== null,
        lastUpdated: Date.now()
      })
    } catch {
      setStatus((prev) => ({
        ...prev,
        connected: false,
        lastUpdated: Date.now()
      }))
    }
  }, [port])

  useEffect(() => {
    if (port === null) {
      return
    }

    const initialTimer = setTimeout(() => {
      fetchStatus()
    }, INITIAL_FETCH_DELAY_MS)

    intervalRef.current = setInterval(fetchStatus, NETWORK_POLL_INTERVAL_MS)

    return (): void => {
      clearTimeout(initialTimer)
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [port, fetchStatus])

  return status
}

export { useNetworkStatus }
export type { NetworkStatus }
