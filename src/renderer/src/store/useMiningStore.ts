import { create } from 'zustand'

const MAX_FOUND_BLOCKS = 500

interface FoundBlock {
  number: number
  hash: string
  miner: string
  timestamp: number
}

interface MiningStore {
  sessionStartTime: number | null
  foundBlocks: FoundBlock[]
  startMining: () => void
  stopMining: () => void
  recordFoundBlocks: (blocks: FoundBlock[]) => void
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
  startMining: () => {
    if (get().sessionStartTime !== null) return
    set({ sessionStartTime: Date.now() })
  },
  stopMining: () => set({ sessionStartTime: null }),
  recordFoundBlocks: (blocks: FoundBlock[]) => {
    if (blocks.length === 0) return
    set((state) => {
      const knownHashes = new Set(state.foundBlocks.map((block) => block.hash))
      const additions = blocks.filter((block) => !knownHashes.has(block.hash))
      if (additions.length === 0) return state
      return { foundBlocks: [...additions, ...state.foundBlocks].slice(0, MAX_FOUND_BLOCKS) }
    })
  }
}))

export type { FoundBlock }
