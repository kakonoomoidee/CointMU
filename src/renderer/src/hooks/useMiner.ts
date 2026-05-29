import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchMiningStatus,
  fetchHashrate,
  setEtherbase,
  startMiner,
  stopMiner
} from '@/services/rpcClient'

const MINER_POLL_INTERVAL_MS = 3000
const DEFAULT_THREAD_COUNT = 4

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
 * Custom hook that polls the mining status and hashrate from the remote
 * Core-geth node via raw JSON-RPC calls, and exposes imperative start and
 * stop functions for the UI layer. Before starting the miner, it sets the
 * etherbase to the active wallet address to ensure rewards are credited
 * correctly.
 * @param activeWalletAddress - The currently active wallet address for etherbase.
 * @param threadCount - The number of CPU threads to allocate for mining.
 * @returns An object containing the current miner state, a start handler, and a stop handler.
 */
function useMiner(
  activeWalletAddress: string | null,
  threadCount: number = DEFAULT_THREAD_COUNT
): {
  state: MinerState
  handleStart: () => Promise<void>
  handleStop: () => Promise<void>
} {
  const [state, setState] = useState<MinerState>(INITIAL_MINER_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async (): Promise<void> => {
    try {
      const [miningResult, hashrateResult] = await Promise.all([
        fetchMiningStatus(),
        fetchHashrate()
      ])

      setState((prev) => ({
        ...prev,
        mining: miningResult !== null ? miningResult : prev.mining,
        hashrate: hashrateResult
      }))
    } catch {
      setState((prev) => ({
        ...prev,
        mining: false,
        hashrate: null
      }))
    }
  }, [])

  useEffect(() => {
    poll()

    intervalRef.current = setInterval(poll, MINER_POLL_INTERVAL_MS)

    return (): void => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [poll])

  const handleStart = useCallback(async (): Promise<void> => {
    if (activeWalletAddress === null) {
      setState((prev) => ({ ...prev, error: 'No active wallet address available' }))
      return
    }

    setState((prev) => ({ ...prev, toggling: true, error: null }))

    try {
      await setEtherbase(activeWalletAddress)
      await startMiner(threadCount)
      await poll()
      setState((prev) => ({ ...prev, toggling: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start miner'
      setState((prev) => ({ ...prev, toggling: false, error: message }))
    }
  }, [activeWalletAddress, threadCount, poll])

  const handleStop = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, toggling: true, error: null }))

    try {
      await stopMiner()
      await poll()
      setState((prev) => ({ ...prev, toggling: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop miner'
      setState((prev) => ({ ...prev, toggling: false, error: message }))
    }
  }, [poll])

  return { state, handleStart, handleStop }
}

export { useMiner }
export type { MinerState }
