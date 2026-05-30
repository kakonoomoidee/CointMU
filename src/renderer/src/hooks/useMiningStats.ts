import { useState, useEffect } from 'react'
import { fetchMiningStats, subscribeDagProgress, subscribeMiningStatus } from '@/services'

const STATS_POLL_INTERVAL_MS = 2000
const HASHES_PER_MEGAHASH = 1_000_000
const DAG_COMPLETE_PERCENT = 100

interface MiningTelemetry {
  hashrateMhs: number
  isMining: boolean
  difficulty: number
  blockNumber: number
  dagProgress: number
  isGeneratingDag: boolean
  powerStatus: string
}

const INITIAL_TELEMETRY: MiningTelemetry = {
  hashrateMhs: 0,
  isMining: false,
  difficulty: 0,
  blockNumber: 0,
  dagProgress: 0,
  isGeneratingDag: false,
  powerStatus: ''
}

/**
 * Hook that aggregates live mining telemetry. It polls the node stats snapshot
 * on a fixed interval and subscribes to DAG-progress and power-status events
 * pushed from the main process, exposing a single reactive telemetry object.
 * @returns The current mining telemetry.
 */
function useMiningStats(): MiningTelemetry {
  const [telemetry, setTelemetry] = useState<MiningTelemetry>(INITIAL_TELEMETRY)

  useEffect(() => {
    let mounted = true

    const poll = async (): Promise<void> => {
      const stats = await fetchMiningStats()
      if (!mounted || stats === null) {
        return
      }
      setTelemetry((prev) => ({
        ...prev,
        hashrateMhs: Number(stats.hashrate) / HASHES_PER_MEGAHASH,
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

  return telemetry
}

export { useMiningStats }
export type { MiningTelemetry }
