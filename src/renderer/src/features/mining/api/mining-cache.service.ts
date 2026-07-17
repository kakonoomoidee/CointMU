import { type MinerEntry } from '../lib/miner-distribution.util';
import { type FoundBlock } from '../model/mining.store';

let minerDistributionCache: MinerEntry[] | undefined;
let foundBlocksCache: FoundBlock[] | undefined;

let minerDistributionPollingInterval: ReturnType<typeof setInterval> | null =
  null;
let foundBlocksPollingInterval: ReturnType<typeof setInterval> | null = null;

/**
 * A module-scoped in-memory cache service for mining statistics.
 * Provides stale-while-revalidate semantics with background polling.
 */
export const MiningCacheService = {
  /**
   * Retrieves the cached miner distribution data.
   * @returns The cached array of MinerEntry, or undefined if not cached.
   */
  getMinerDistribution: (): MinerEntry[] | undefined => {
    return minerDistributionCache;
  },

  /**
   * Caches the miner distribution data globally.
   * @param data - The array of MinerEntry to cache.
   * @returns void
   */
  setMinerDistribution: (data: MinerEntry[]): void => {
    minerDistributionCache = data;
  },

  /**
   * Starts a single global background polling interval for the miner
   * distribution dataset.
   * @param fetcher - An async function that fetches and returns the latest miner entries.
   * @param onData - A callback invoked with fresh data after each fetch.
   * @param intervalMs - The polling cadence in milliseconds.
   * @returns void
   */
  startMinerDistributionPolling: (
    fetcher: () => Promise<MinerEntry[]>,
    onData: (data: MinerEntry[]) => void,
    intervalMs: number,
  ): void => {
    if (minerDistributionPollingInterval !== null) return;
    const tick = async (): Promise<void> => {
      try {
        const data = await fetcher();
        MiningCacheService.setMinerDistribution(data);
        onData(data);
      } catch {
        // Silently ignore polling errors
      }
    };
    void tick();
    minerDistributionPollingInterval = setInterval(() => {
      void tick();
    }, intervalMs);
  },

  /**
   * Stops the global miner distribution polling interval.
   * @returns void
   */
  stopMinerDistributionPolling: (): void => {
    if (minerDistributionPollingInterval !== null) {
      clearInterval(minerDistributionPollingInterval);
      minerDistributionPollingInterval = null;
    }
  },

  /**
   * Retrieves the cached found blocks list.
   * @returns The cached array of FoundBlock, or undefined if not yet populated.
   */
  getFoundBlocks: (): FoundBlock[] | undefined => {
    return foundBlocksCache;
  },

  /**
   * Caches the found blocks list globally.
   * @param data - The array of FoundBlock to cache.
   * @returns void
   */
  setFoundBlocks: (data: FoundBlock[]): void => {
    foundBlocksCache = data;
  },

  /**
   * Starts a single global background polling interval to refresh the found
   * blocks dataset from the node.
   * @param fetcher - An async function that fetches and returns the latest found blocks.
   * @param onData - A callback invoked with fresh data after each successful fetch.
   * @param intervalMs - The polling cadence in milliseconds.
   * @returns void
   */
  startFoundBlocksPolling: (
    fetcher: () => Promise<FoundBlock[]>,
    onData: (data: FoundBlock[]) => void,
    intervalMs: number,
  ): void => {
    if (foundBlocksPollingInterval !== null) return;
    const tick = async (): Promise<void> => {
      try {
        const data = await fetcher();
        MiningCacheService.setFoundBlocks(data);
        onData(data);
      } catch {
        // Silently ignore polling errors
      }
    };
    void tick();
    foundBlocksPollingInterval = setInterval(() => {
      void tick();
    }, intervalMs);
  },

  /**
   * Stops the global found blocks polling interval.
   * @returns void
   */
  stopFoundBlocksPolling: (): void => {
    if (foundBlocksPollingInterval !== null) {
      clearInterval(foundBlocksPollingInterval);
      foundBlocksPollingInterval = null;
    }
  },
};
