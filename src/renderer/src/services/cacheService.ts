import { type ActivityData } from '@/views/Wallet/ActivityItem'
import { type MinerEntry } from '@/utils/minerDistribution'

const activityCache = new Map<string, ActivityData[]>()
const tokenBalanceCache = new Map<string, Record<string, string>>()
let minerDistributionCache: MinerEntry[] | undefined

const activityPollingIntervals = new Map<string, ReturnType<typeof setInterval>>()
let minerDistributionPollingInterval: ReturnType<typeof setInterval> | null = null

/**
 * A lightweight, module-scoped in-memory cache service for wallet data and
 * network statistics. Provides stale-while-revalidate semantics: cached data
 * is served synchronously while background polling silently updates it without
 * triggering loading spinners or layout shifts.
 */
export const CacheService = {
  /**
   * Retrieves the cached activity list for a given wallet address.
   * @param address - The wallet address used as the cache key.
   * @returns The cached array of ActivityData, or undefined if not cached.
   */
  getActivity: (address: string): ActivityData[] | undefined => {
    return activityCache.get(address)
  },

  /**
   * Caches the activity list for a given wallet address.
   * @param address - The wallet address used as the cache key.
   * @param data - The array of ActivityData to cache.
   * @returns void
   */
  setActivity: (address: string, data: ActivityData[]): void => {
    activityCache.set(address, data)
  },

  /**
   * Retrieves the cached token balances for a given wallet address.
   * @param address - The wallet address used as the cache key.
   * @returns The cached record of token balances (symbol -> balance), or undefined.
   */
  getTokenBalances: (address: string): Record<string, string> | undefined => {
    return tokenBalanceCache.get(address)
  },

  /**
   * Caches the token balances for a given wallet address.
   * @param address - The wallet address used as the cache key.
   * @param balances - The record of token balances (symbol -> balance) to cache.
   * @returns void
   */
  setTokenBalances: (address: string, balances: Record<string, string>): void => {
    tokenBalanceCache.set(address, balances)
  },

  /**
   * Retrieves the cached miner distribution data.
   * @returns The cached array of MinerEntry, or undefined if not cached.
   */
  getMinerDistribution: (): MinerEntry[] | undefined => {
    return minerDistributionCache
  },

  /**
   * Caches the miner distribution data globally (not keyed per address).
   * @param data - The array of MinerEntry to cache.
   * @returns void
   */
  setMinerDistribution: (data: MinerEntry[]): void => {
    minerDistributionCache = data
  },

  /**
   * Starts a background polling interval for the activity of a specific
   * wallet address. The fetcher is invoked immediately and then every
   * `intervalMs` milliseconds. Calling this method for an address that
   * already has a running interval is a no-op to prevent duplicates.
   * @param address - The wallet address to poll activity for.
   * @param fetcher - An async function that fetches and returns the latest activity.
   * @param onData - A callback invoked with fresh data after each fetch.
   * @param intervalMs - The polling cadence in milliseconds.
   * @returns void
   */
  startActivityPolling: (
    address: string,
    fetcher: () => Promise<ActivityData[]>,
    onData: (data: ActivityData[]) => void,
    intervalMs: number
  ): void => {
    if (activityPollingIntervals.has(address)) return
    const tick = async (): Promise<void> => {
      try {
        const data = await fetcher()
        CacheService.setActivity(address, data)
        onData(data)
      } catch {
        // Silently ignore polling errors to avoid disrupting the UI.
      }
    }
    void tick()
    const id = setInterval(() => { void tick() }, intervalMs)
    activityPollingIntervals.set(address, id)
  },

  /**
   * Stops the background activity polling interval for a given wallet address
   * and removes it from the registry.
   * @param address - The wallet address whose polling interval should be cleared.
   * @returns void
   */
  stopActivityPolling: (address: string): void => {
    const id = activityPollingIntervals.get(address)
    if (id !== undefined) {
      clearInterval(id)
      activityPollingIntervals.delete(address)
    }
  },

  /**
   * Starts a single global background polling interval for the miner
   * distribution dataset. The fetcher is invoked immediately and then every
   * `intervalMs` milliseconds. A second call while a poll is already running
   * is a no-op.
   * @param fetcher - An async function that fetches and returns the latest miner entries.
   * @param onData - A callback invoked with fresh data after each fetch.
   * @param intervalMs - The polling cadence in milliseconds.
   * @returns void
   */
  startMinerDistributionPolling: (
    fetcher: () => Promise<MinerEntry[]>,
    onData: (data: MinerEntry[]) => void,
    intervalMs: number
  ): void => {
    if (minerDistributionPollingInterval !== null) return
    const tick = async (): Promise<void> => {
      try {
        const data = await fetcher()
        CacheService.setMinerDistribution(data)
        onData(data)
      } catch {
        // Silently ignore polling errors to avoid disrupting the UI.
      }
    }
    void tick()
    minerDistributionPollingInterval = setInterval(() => { void tick() }, intervalMs)
  },

  /**
   * Stops the global miner distribution polling interval and clears the
   * interval reference.
   * @returns void
   */
  stopMinerDistributionPolling: (): void => {
    if (minerDistributionPollingInterval !== null) {
      clearInterval(minerDistributionPollingInterval)
      minerDistributionPollingInterval = null
    }
  }
}
