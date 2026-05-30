import { create } from 'zustand'

interface MiningStore {
  startTime: number | null
  isMining: boolean
  toggleMining: (status: boolean) => void
  resetTimer: () => void
}

/**
 * Manages global mining state to persist across route transitions.
 */
export const useMiningStore = create<MiningStore>((set, get) => ({
  startTime: null,
  isMining: false,
  toggleMining: (status: boolean) => {
    const current = get()
    if (current.isMining === status) return
    set({ isMining: status, startTime: status ? Date.now() : null })
  },
  resetTimer: () => set({ startTime: null })
}))
