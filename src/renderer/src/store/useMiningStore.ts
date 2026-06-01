import { create } from 'zustand'

const MAX_FOUND_BLOCKS = 500
const MAX_HASHRATE_HISTORY = 60
const MAX_MINING_LOGS = 200

interface FoundBlock {
  number: number
  hash: string
  miner: string
  timestamp: number
}

interface MiningLog {
  id: string
  timestamp: string
  level: 'INFO' | 'OK' | 'WARN' | 'ERROR'
  message: string
}

interface MiningStore {
  sessionStartTime: number | null
  foundBlocks: FoundBlock[]
  nonce: number
  candidate: number | null
  hashrateMhs: number
  hashrateHistory: number[]
  miningLogs: MiningLog[]
  startMining: () => void
  stopMining: () => void
  recordFoundBlocks: (blocks: FoundBlock[]) => void
  updateTelemetry: (nonce: number, candidate: number | null) => void
  setHashrate: (hashrateMhs: number) => void
  addMiningLog: (log: MiningLog) => void
}

/**
 * Global mining state shared across route transitions. Persisting the session
 * start timestamp and the accumulated list of found blocks here, rather than in
 * component state, ensures both survive view switches that would otherwise
 * unmount the mining view and discard local state. startMining is idempotent so
 * that the transient isMining flicker on remount cannot restart the clock.
 */
export const useMiningStore = create<MiningStore>((set, get) => ({
  sessionStartTime: null,
  foundBlocks: [],
  nonce: 0,
  candidate: null,
  hashrateMhs: 0,
  hashrateHistory: [],
  miningLogs: [],
  startMining: () => {
    if (get().sessionStartTime !== null) return
    set({ sessionStartTime: Date.now() })
  },
  stopMining: () =>
    set({ sessionStartTime: null, nonce: 0, candidate: null, hashrateMhs: 0, hashrateHistory: [] }),
  recordFoundBlocks: (blocks: FoundBlock[]) => {
    if (blocks.length === 0) return
    set((state) => {
      const knownHashes = new Set(state.foundBlocks.map((block) => block.hash))
      const additions = blocks.filter((block) => !knownHashes.has(block.hash))
      if (additions.length === 0) return state
      return { foundBlocks: [...additions, ...state.foundBlocks].slice(0, MAX_FOUND_BLOCKS) }
    })
  },
  updateTelemetry: (nonce: number, candidate: number | null) => {
    set((state) => {
      if (state.candidate !== null && state.candidate !== candidate) {
        return { candidate, nonce: 0 }
      }
      return { candidate, nonce }
    })
  },
  setHashrate: (hashrateMhs: number) =>
    set((state) => ({
      hashrateMhs,
      hashrateHistory: [...state.hashrateHistory, hashrateMhs].slice(-MAX_HASHRATE_HISTORY)
    })),
  addMiningLog: (log: MiningLog) =>
    set((state) => ({
      miningLogs: [log, ...state.miningLogs].slice(0, MAX_MINING_LOGS)
    }))
}))

export type { FoundBlock, MiningLog }
