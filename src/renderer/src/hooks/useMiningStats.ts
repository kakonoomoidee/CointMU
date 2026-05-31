import { useState, useEffect } from 'react'
import { fetchMiningStats, subscribeDagProgress, subscribeMiningStatus } from '@/services'
import { fetchHashrate } from '@/services/rpcClient'
import { useMiningStore } from '@/store'

const STATS_POLL_INTERVAL_MS = 2000
const HASHES_PER_MEGAHASH = 1_000_000
const DAG_COMPLETE_PERCENT = 100
const NONCE_TICK_INTERVAL_MS = 100
const NONCE_TICKS_PER_SECOND = 10

interface MiningTelemetry {
  hashrateMhs: number
  isMining: boolean
  difficulty: number
  blockNumber: number
  dagProgress: number
  isGeneratingDag: boolean
  powerStatus: string
}

type PolledTelemetry = Omit<MiningTelemetry, 'hashrateMhs'>

const INITIAL_TELEMETRY: PolledTelemetry = {
  isMining: false,
  difficulty: 0,
  blockNumber: 0,
  dagProgress: 0,
  isGeneratingDag: false,
  powerStatus: ''
}

/**
 * Hook that aggregates live mining telemetry. The mining state, difficulty, and
 * block number are polled from the node stats snapshot, while the hashrate is
 * read straight from the local node via the eth_hashrate JSON-RPC fetcher and
 * lifted into the global mining store so it survives view transitions. The real
 * hashrate poll runs only while mining is active, and its cleanup clears the
 * timer without zeroing the stored value, so the last reading remains visible
 * across navigation until mining is explicitly stopped.
 * @param _cpuThreads - Retained for call-site compatibility; no longer used.
 * @returns The current mining telemetry, including the store-backed hashrate.
 */
function useMiningStats(_cpuThreads: number = 0): MiningTelemetry {
  const [telemetry, setTelemetry] = useState<PolledTelemetry>(INITIAL_TELEMETRY)
  const hashrateMhs = useMiningStore((state) => state.hashrateMhs)

  useEffect(() => {
    let mounted = true

    const poll = async (): Promise<void> => {
      const stats = await fetchMiningStats()
      if (!mounted || stats === null) {
        return
      }

      setTelemetry((prev) => ({
        ...prev,
        isMining: stats.isMining,
        difficulty: stats.difficulty || 0,
        blockNumber: stats.blockNumber || prev.blockNumber
      }))
    }

    poll()
    const intervalId = setInterval(poll, STATS_POLL_INTERVAL_MS)

    return (): void => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    return subscribeDagProgress((progress) => {
      const generating = progress < DAG_COMPLETE_PERCENT
      setTelemetry((prev) => ({
        ...prev,
        isGeneratingDag: generating,
        dagProgress: generating ? progress : 0
      }))
    })
  }, [])

  useEffect(() => {
    return subscribeMiningStatus((status) => {
      setTelemetry((prev) => ({ ...prev, powerStatus: status }))
    })
  }, [])

  useEffect(() => {
    if (!telemetry.isMining) {
      return
    }

    const pushHashrate = async (): Promise<void> => {
      const rawHashesPerSecond = await fetchHashrate()
      if (rawHashesPerSecond === null) {
        return
      }
      useMiningStore.getState().setHashrate(rawHashesPerSecond / HASHES_PER_MEGAHASH)
    }

    pushHashrate()
    const intervalId = setInterval(pushHashrate, STATS_POLL_INTERVAL_MS)

    return (): void => clearInterval(intervalId)
  }, [telemetry.isMining])

  useEffect(() => {
    if (!telemetry.isMining || hashrateMhs <= 0) {
      return
    }

    const hashesPerTick = (hashrateMhs * HASHES_PER_MEGAHASH) / NONCE_TICKS_PER_SECOND
    const intervalId = setInterval(() => {
      const store = useMiningStore.getState()
      store.updateTelemetry(store.nonce + hashesPerTick, telemetry.blockNumber + 1)
    }, NONCE_TICK_INTERVAL_MS)

    return (): void => clearInterval(intervalId)
  }, [telemetry.isMining, hashrateMhs, telemetry.blockNumber])

  return { ...telemetry, hashrateMhs }
}

export { useMiningStats }
export type { MiningTelemetry }
