import { create } from 'zustand'

const MAX_FOUND_BLOCKS = 500

interface FoundBlock {
  number: number
  hash: string
  miner: string
  timestamp: number
}

interface MiningStore {
  startTime: number | null
  isMining: boolean
  foundBlocks: FoundBlock[]
  toggleMining: (status: boolean) => void
  resetTimer: () => void
  recordFoundBlocks: (blocks: FoundBlock[]) => void
}

/**
 * Global mining state shared across route transitions. Persisting the session
 * timer and the accumulated list of found blocks here, rather than in component
 * state, ensures both survive view switches that would otherwise unmount the
 * mining view and discard local state.
 */
export const useMiningStore = create<MiningStore>((set, get) => ({
  startTime: null,
  isMining: false,
  foundBlocks: [],
  toggleMining: (status: boolean) => {
    const current = get()
    if (current.isMining === status) return
    set({ isMining: status, startTime: status ? Date.now() : null })
  },
  resetTimer: () => set({ startTime: null }),
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
