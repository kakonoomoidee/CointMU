import { useState, useEffect, useCallback, useRef } from 'react'
import { createProvider, startMining, stopMining, getMiningStatus, getHashrate } from '@/services'

const MINER_POLL_INTERVAL_MS = 3000
const MINER_THREAD_COUNT = 1

interface MinerState {
  mining: boolean
  hashrate: number | null
  toggling: boolean
  error: string | null
}

const INITIAL_MINER_STATE: MinerState = {
  mining: false,
  hashrate: null,
  toggling: false,
  error: null
}

/**
 * Custom hook that polls the mining status and hashrate from the local node,
 * and exposes imperative start and stop functions for the UI layer.
 * @param port - The dynamically resolved RPC port. Polling activates only when the port is available.
 * @returns An object containing the current miner state, a start handler, and a stop handler.
 */
function useMiner(port: number | null): {
  state: MinerState
  handleStart: () => Promise<void>
  handleStop: () => Promise<void>
} {
  const [state, setState] = useState<MinerState>(INITIAL_MINER_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMinerStatus = useCallback(async (): Promise<void> => {
    if (port === null) {
      return
    }

    const provider = createProvider(port)

    const [miningResult, hashrateResult] = await Promise.allSettled([
      getMiningStatus(provider),
      getHashrate(provider)
    ])

    setState((prev) => ({
      ...prev,
      mining:
        miningResult.status === 'fulfilled' && miningResult.value !== null
          ? miningResult.value
          : prev.mining,
      hashrate:
        hashrateResult.status === 'fulfilled' ? hashrateResult.value : prev.hashrate
    }))
  }, [port])

  useEffect(() => {
    if (port === null) {
      return
    }

    fetchMinerStatus()

    intervalRef.current = setInterval(fetchMinerStatus, MINER_POLL_INTERVAL_MS)

    return (): void => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [port, fetchMinerStatus])

  const handleStart = useCallback(async (): Promise<void> => {
    if (port === null) {
      return
    }

    setState((prev) => ({ ...prev, toggling: true, error: null }))

    try {
      const provider = createProvider(port)
      const result = await startMining(provider, MINER_THREAD_COUNT)

      if (result === null) {
        setState((prev) => ({ ...prev, toggling: false, error: 'Failed to start miner' }))
        return
      }

      await fetchMinerStatus()
      setState((prev) => ({ ...prev, toggling: false }))
    } catch {
      setState((prev) => ({ ...prev, toggling: false, error: 'Failed to start miner' }))
    }
  }, [port, fetchMinerStatus])

  const handleStop = useCallback(async (): Promise<void> => {
    if (port === null) {
      return
    }

    setState((prev) => ({ ...prev, toggling: true, error: null }))

    try {
      const provider = createProvider(port)
      const result = await stopMining(provider)

      if (result === null) {
        setState((prev) => ({ ...prev, toggling: false, error: 'Failed to stop miner' }))
        return
      }

      await fetchMinerStatus()
      setState((prev) => ({ ...prev, toggling: false }))
    } catch {
      setState((prev) => ({ ...prev, toggling: false, error: 'Failed to stop miner' }))
    }
  }, [port, fetchMinerStatus])

  return { state, handleStart, handleStop }
}

export { useMiner }
export type { MinerState }
