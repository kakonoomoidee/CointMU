const tokenBalanceCache = new Map<string, Record<string, string>>();

/**
 * A module-scoped in-memory cache service for wallet data.
 */
export const WalletCacheService = {
  /**
   * Retrieves the cached token balances for a given wallet address.
   * @param address - The wallet address used as the cache key.
   * @returns The cached record of token balances (symbol -> balance), or undefined.
   */
  getTokenBalances: (address: string): Record<string, string> | undefined => {
    return tokenBalanceCache.get(address);
  },

  /**
   * Caches the token balances for a given wallet address.
   * @param address - The wallet address used as the cache key.
   * @param balances - The record of token balances (symbol -> balance) to cache.
   * @returns void
   */
  setTokenBalances: (
    address: string,
    balances: Record<string, string>,
  ): void => {
    tokenBalanceCache.set(address, balances);
  },
};
