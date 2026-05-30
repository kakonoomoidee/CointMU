import { useState, useEffect } from 'react'
import { fetchMiningStats, subscribeDagProgress, subscribeMiningStatus } from '@/services'

const STATS_POLL_INTERVAL_MS = 2000
const HASHES_PER_MEGAHASH = 1_000_000
const DAG_COMPLETE_PERCENT = 100
const ESTIMATED_MHS_PER_THREAD = 0.5

interface MiningTelemetry {
  hashrateMhs: number
  rawHashrateMhs: number
  isMining: boolean
  difficulty: number
  blockNumber: number
  dagProgress: number
  isGeneratingDag: boolean
  powerStatus: string
}

const INITIAL_TELEMETRY: MiningTelemetry = {
  hashrateMhs: 0,
  rawHashrateMhs: 0,
  isMining: false,
  difficulty: 0,
  blockNumber: 0,
  dagProgress: 0,
  isGeneratingDag: false,
  powerStatus: ''
}

/**
 * Hook that aggregates live mining telemetry. It polls the node stats snapshot
 * on a fixed interval, converts the raw hashrate from hashes per second into
 * megahashes per second, and subscribes to DAG-progress and power-status events
 * from the main process. When the node reports a zero hashrate while mining is
 * active, a known quirk of the Core-geth internal CPU miner, an estimate
 * derived from the allocated CPU thread count is substituted so the display
 * reflects active work. The unmodified raw value is also exposed for diagnostics.
 * @param cpuThreads - The number of CPU threads allocated, used for the estimate.
 * @returns The current mining telemetry with both effective and raw hashrate.
 */
function useMiningStats(cpuThreads: number = 0): MiningTelemetry {
  const [telemetry, setTelemetry] = useState<MiningTelemetry>(INITIAL_TELEMETRY)

  useEffect(() => {
    let mounted = true

    const poll = async (): Promise<void> => {
      const stats = await fetchMiningStats()
      if (!mounted || stats === null) {
        return
      }

      const rawHashrateMhs = Number(stats.hashrate) / HASHES_PER_MEGAHASH
      const estimatedMhs = cpuThreads * ESTIMATED_MHS_PER_THREAD
      const usingEstimate = stats.isMining && rawHashrateMhs <= 0
      const effectiveMhs = usingEstimate ? estimatedMhs : rawHashrateMhs

      if (usingEstimate) {
        console.warn(
          `[useMiningStats] Node reported 0 hashrate while mining (raw hashes/s=${stats.hashrate}). Substituting estimate ${effectiveMhs} MH/s.`
        )
      }

      setTelemetry((prev) => ({
        ...prev,
        hashrateMhs: effectiveMhs,
        rawHashrateMhs,
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
  }, [cpuThreads])

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
