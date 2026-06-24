import { type ActivityData } from '@/views/Wallet/ActivityItem'

const activityCache = new Map<string, ActivityData[]>()
const tokenBalanceCache = new Map<string, Record<string, string>>()

/**
 * A lightweight, module-scoped in-memory cache service for wallet data.
 * This ensures that switching between wallets or views (which unmounts the components)
 * does not result in jarring empty loading states, as data can be served synchronously
 * while revalidation occurs silently in the background.
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
   */
  setTokenBalances: (address: string, balances: Record<string, string>): void => {
    tokenBalanceCache.set(address, balances)
  }
}
