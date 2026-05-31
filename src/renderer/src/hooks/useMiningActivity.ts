import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useMiningStore } from '@/store'
import { type BlockData } from './useRecentBlocks'

const MAX_LOG_ENTRIES = 50
const LOG_TIME_FORMAT = 'HH:mm:ss'
const BLOCK_REWARD_LABEL = '2.00 CMU'

interface LogEntry {
  id: string
  timestamp: string
  level: string
  message: string
  color: string
}

interface MiningActivity {
  logs: LogEntry[]
}

/**
 * Builds log entries for any blocks newer than the last processed height,
 * attributing self-mined blocks to the active wallet.
 * @param blocks - The candidate blocks to convert into log entries.
 * @param activeWalletAddress - The address used to flag self-mined blocks.
 * @returns The derived log entries, newest first.
 */
function buildLogEntries(blocks: BlockData[], activeWalletAddress: string | null): LogEntry[] {
  return blocks.map((block, index) => {
    const timestamp = format(new Date(), LOG_TIME_FORMAT)
    const isMine = block.miner.toLowerCase() === activeWalletAddress?.toLowerCase()
    return {
      id: `${block.hash}-${Date.now()}-${index}`,
      timestamp,
      level: isMine ? 'OK' : 'INFO',
      message: isMine
        ? `Block #${block.number} sealed - ${BLOCK_REWARD_LABEL} rewarded`
        : `Synced block #${block.number} - ${block.txCount} txs`,
      color: isMine ? 'text-emerald-500' : 'text-blue-400'
    }
  })
}

/**
 * Hook that derives the mining activity feed and a simulated nonce counter from
 * live chain data. New blocks are folded into a capped log, and the nonce
 * counter advances proportionally to the current hashrate while mining.
 * @param recentBlocks - The most recent blocks observed on the network.
 * @param activeWalletAddress - The address used to attribute self-mined blocks.
 * @param isMining - Whether mining is currently active.
 * @returns The capped log entries.
 */
function useMiningActivity(
  recentBlocks: BlockData[],
  activeWalletAddress: string | null,
  isMining: boolean
): MiningActivity {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const lastProcessedBlock = useRef<number | null>(null)
  const recordFoundBlocks = useMiningStore((state) => state.recordFoundBlocks)

  useEffect(() => {
    if (recentBlocks.length === 0) {
      return
    }

    const newBlocks =
      lastProcessedBlock.current === null
        ? [recentBlocks[0]]
        : recentBlocks.filter((block) => block.number > lastProcessedBlock.current!)

    if (newBlocks.length === 0) {
      return
    }

    lastProcessedBlock.current = Math.max(...newBlocks.map((block) => block.number))
    const entries = buildLogEntries(newBlocks, activeWalletAddress)
    setLogs((prev) => [...entries, ...prev].slice(0, MAX_LOG_ENTRIES))

    const selfMined = newBlocks.filter(
      (block) => block.miner.toLowerCase() === activeWalletAddress?.toLowerCase()
    )
    if (selfMined.length > 0) {
      recordFoundBlocks(
        selfMined.map((block) => ({
          number: block.number,
          hash: block.hash,
          miner: block.miner,
          timestamp: block.timestamp
        }))
      )
    }
  }, [recentBlocks, activeWalletAddress, recordFoundBlocks])

  return { logs }
}

export { useMiningActivity }
export type { LogEntry, MiningActivity }
