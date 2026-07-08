import { create } from 'zustand'
import { getSetting, setSetting } from '@/services/settingsService'

const SETTINGS_KEY = 'connectedSites'

interface ConnectedSitesStore {
  connectedSites: string[]
  hydrated: boolean
  hydrate: () => Promise<void>
  addConnectedSite: (origin: string) => void
  removeConnectedSite: (origin: string) => void
}

/**
 * Persists the connected sites list to electron-store, swallowing write errors so
 * a storage failure never breaks the in-memory preference flow.
 * @param sites - The array of connected site origins to persist.
 * @returns Nothing.
 */
function persistSites(sites: string[]): void {
  void setSetting(SETTINGS_KEY, sites).catch((err) => {
    console.error('Failed to persist connected sites', err)
  })
}

/**
 * Global store managing the whitelist of dApp origins that the user has
 * explicitly approved. Approved origins are allowed to make read-only
 * JSON-RPC requests without triggering the approval modal.
 */
export const useConnectedSitesStore = create<ConnectedSitesStore>((set, get) => ({
  connectedSites: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return
    try {
      const stored = await getSetting<string[] | null>(SETTINGS_KEY)
      set({ connectedSites: stored ?? [], hydrated: true })
    } catch (err) {
      console.error('Failed to hydrate connected sites store', err)
      set({ hydrated: true })
    }
  },
  addConnectedSite: (origin: string) => {
    set((state) => {
      if (state.connectedSites.includes(origin)) return state
      const sites = [...state.connectedSites, origin]
      persistSites(sites)
      return { connectedSites: sites }
    })
  },
  removeConnectedSite: (origin: string) => {
    set((state) => {
      const sites = state.connectedSites.filter((site) => site !== origin)
      persistSites(sites)
      return { connectedSites: sites }
    })
  }
}))
