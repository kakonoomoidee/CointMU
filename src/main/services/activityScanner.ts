import { callGethRpc, toHex, safeParseHex, formatTimeAgo } from '../utils/rpcUtils';

const ACTIVITY_BLOCK_SCAN_DEPTH = 500;
const MINING_BLOCK_REWARD = '2.00';
const INSIGHTS_BLOCK_WINDOW = 12;
const BLOCK_TIME_REFERENCE_DEPTH = 100;

/**
 * A single wallet activity event representing a mining reward, a token transfer,
 * or a contract interaction extracted from on-chain block data.
 */
interface ActivityItem {
  id: string;
  type: 'mining' | 'contract' | 'send' | 'receive';
  title: string;
  subtitle: string;
  amount: string;
  timestamp: number;
  blockNumber: number;
  timestampStr: string;
  hash?: string;
  from?: string;
  to: string;
}

/**
 * A summarized block record returned as part of the network insights payload.
 */
interface InsightBlock {
  number: number;
  hash: string;
  miner: string;
  timestamp: number;
  txCount: number;
}

/**
 * The aggregated network statistics payload returned by fetchNetworkInsights.
 */
interface NetworkInsights {
  isOnline: boolean;
  height: number;
  blockTime: number;
  transactions: number;
  activeAddresses: number;
  difficulty: number;
  blocks: InsightBlock[];
  coinbase: string;
}

const OFFLINE_INSIGHTS: NetworkInsights = {
  isOnline: false,
  height: 0,
  blockTime: 0,
  transactions: 0,
  activeAddresses: 0,
  difficulty: 0,
  blocks: [],
  coinbase: '',
};

/**
 * Classifies a raw RPC transaction object into a typed ActivityItem based on its
 * direction and input data relative to the given set of owned addresses.
 * Returns null when neither the sender nor the recipient belongs to the owned set.
 * @param {any} tx - The raw RPC transaction object from eth_getBlockByNumber.
 * @param {Set<string>} targets - The lowercased set of owned wallet addresses.
 * @param {number} timestamp - The Unix timestamp of the containing block.
 * @param {number} blockNum - The block number of the containing block.
 * @param {string} timestampStr - The pre-formatted timestamp display string.
 * @returns {ActivityItem | null} The classified activity item, or null when not relevant.
 */
function classifyTransaction(
  tx: any,
  targets: Set<string>,
  timestamp: number,
  blockNum: number,
  timestampStr: string,
): ActivityItem | null {
  const isFrom = tx.from && targets.has(tx.from.toLowerCase());
  const isTo = tx.to && targets.has(tx.to.toLowerCase());
  if (!isFrom && !isTo) return null;

  let amount = '0.00';
  if (tx.value) {
    amount = (parseInt(tx.value, 16) / 1e18).toFixed(2);
  }

  if (isFrom && !tx.to) {
    return {
      id: tx.hash,
      type: 'contract',
      title: 'Contract deployment',
      subtitle: `Hash ${tx.hash.substring(0, 8)}...`,
      amount,
      timestamp,
      blockNumber: blockNum,
      timestampStr,
      hash: tx.hash,
      from: tx.from,
      to: '',
    };
  }

  if (isFrom && tx.to && tx.input && tx.input !== '0x') {
    return {
      id: tx.hash,
      type: 'contract',
      title: 'Contract call',
      subtitle: `To ${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}`,
      amount,
      timestamp,
      blockNumber: blockNum,
      timestampStr,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
    };
  }

  if (isFrom) {
    return {
      id: tx.hash,
      type: 'send',
      title: 'Sent CMU',
      subtitle: `To ${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}`,
      amount,
      timestamp,
      blockNumber: blockNum,
      timestampStr,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
    };
  }

  return {
    id: tx.hash,
    type: 'receive',
    title: 'Received CMU',
    subtitle: `From ${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`,
    amount,
    timestamp,
    blockNumber: blockNum,
    timestampStr,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
  };
}

/**
 * Scans the most recent blocks for wallet activity attributed to the given addresses.
 * Fetches up to ACTIVITY_BLOCK_SCAN_DEPTH blocks sequentially and classifies every
 * transaction and mining reward found. Results are sorted newest-first.
 * @param {number} rpcPort - The resolved RPC port of the running Geth node.
 * @param {string[]} addresses - The wallet addresses to scan activity for.
 * @returns {Promise<ActivityItem[]>} The wallet activity items, newest first.
 */
export async function scanWalletActivity(
  rpcPort: number,
  addresses: string[],
): Promise<ActivityItem[]> {
  try {
    if (!Array.isArray(addresses) || addresses.length === 0) return [];
    const targets = new Set(addresses.map((addr) => addr.toLowerCase()));

    const latestBlockHex = await callGethRpc(rpcPort, 'eth_blockNumber');
    if (!latestBlockHex) return [];
    const latest = parseInt(latestBlockHex, 16);
    const start = Math.max(0, latest - ACTIVITY_BLOCK_SCAN_DEPTH);

    const activities: ActivityItem[] = [];

    for (let i = latest; i > start; i--) {
      const block = await callGethRpc(rpcPort, 'eth_getBlockByNumber', [toHex(i), true]);
      if (!block) continue;

      const blockNum = parseInt(block.number, 16);
      const timestamp = parseInt(block.timestamp, 16);
      const confs = latest - blockNum + 1;
      const timestampStr = `${formatTimeAgo(timestamp)} · ${confs} confs`;

      if (block.miner && targets.has(block.miner.toLowerCase())) {
        activities.push({
          id: `block-${block.number}`,
          type: 'mining',
          title: 'Mining reward',
          subtitle: `From mining pool · block #${blockNum}`,
          amount: MINING_BLOCK_REWARD,
          timestamp,
          blockNumber: blockNum,
          timestampStr,
          to: block.miner,
        });
      }

      if (block.transactions && Array.isArray(block.transactions)) {
        for (const tx of block.transactions) {
          const item = classifyTransaction(tx, targets, timestamp, blockNum, timestampStr);
          if (item) activities.push(item);
        }
      }
    }

    activities.sort((a, b) => b.timestamp - a.timestamp);
    return activities;
  } catch (err) {
    console.error('[activity] Failed to scan wallet activity:', err);
    return [];
  }
}

/**
 * Fetches aggregated network statistics from the local Geth node, covering the
 * latest block height, average block time, recent transaction volume, active unique
 * addresses, current mining difficulty, and a summarized block list.
 * Returns an offline payload when the node is unreachable or the chain is empty.
 * @param {number} rpcPort - The resolved RPC port of the running Geth node.
 * @returns {Promise<NetworkInsights>} The aggregated network statistics payload.
 */
export async function fetchNetworkInsights(rpcPort: number): Promise<NetworkInsights> {
  try {
    const heightHex = await callGethRpc(rpcPort, 'eth_blockNumber');
    if (!heightHex || typeof heightHex !== 'string') {
      return { ...OFFLINE_INSIGHTS };
    }

    const height = parseInt(heightHex, 16);
    if (isNaN(height) || height < 0) {
      return { ...OFFLINE_INSIGHTS };
    }

    const blockSettled = await Promise.allSettled(
      Array.from({ length: INSIGHTS_BLOCK_WINDOW }, (_, i) => {
        const blockNum = Math.max(0, height - i);
        return callGethRpc(rpcPort, 'eth_getBlockByNumber', [toHex(blockNum), true]);
      }),
    );

    const latest12Blocks = blockSettled
      .filter(
        (r): r is PromiseFulfilledResult<any> =>
          r.status === 'fulfilled' &&
          r.value !== null &&
          r.value !== undefined,
      )
      .map((r) => r.value)
      .filter((b) => b && typeof b.number === 'string');

    if (latest12Blocks.length === 0) {
      return {
        isOnline: true,
        height,
        blockTime: 0,
        transactions: 0,
        activeAddresses: 0,
        difficulty: 0,
        blocks: [],
        coinbase: '',
      };
    }

    const past100Block =
      height >= BLOCK_TIME_REFERENCE_DEPTH
        ? await callGethRpc(rpcPort, 'eth_getBlockByNumber', [
            toHex(height - BLOCK_TIME_REFERENCE_DEPTH),
            false,
          ])
        : null;

    const coinbaseResult = await callGethRpc(rpcPort, 'eth_coinbase');
    const coinbase = coinbaseResult || '';

    let totalTxs = 0;
    const activeAddrs = new Set<string>();

    for (const block of latest12Blocks) {
      if (!block) continue;
      if (block.transactions && Array.isArray(block.transactions)) {
        totalTxs += block.transactions.length;
        for (const tx of block.transactions) {
          if (tx && typeof tx === 'object') {
            if (tx.from && typeof tx.from === 'string') {
              activeAddrs.add(tx.from.toLowerCase());
            }
            if (tx.to && typeof tx.to === 'string') {
              activeAddrs.add(tx.to.toLowerCase());
            }
          }
        }
      }
    }

    let blockTime = 0;
    if (
      past100Block !== null &&
      past100Block !== undefined &&
      typeof past100Block.timestamp === 'string' &&
      latest12Blocks[0] !== null &&
      latest12Blocks[0] !== undefined &&
      typeof latest12Blocks[0].timestamp === 'string'
    ) {
      const latestTime = safeParseHex(latest12Blocks[0].timestamp);
      const pastTime = safeParseHex(past100Block.timestamp);
      const pastBlockNum = safeParseHex(past100Block.number);
      const diffBlocks = height - pastBlockNum;
      if (diffBlocks > 0 && latestTime > 0 && pastTime > 0) {
        blockTime = (latestTime - pastTime) / diffBlocks;
      }
    } else if (latest12Blocks.length > 1) {
      const newest = latest12Blocks[0];
      const oldest = latest12Blocks[latest12Blocks.length - 1];
      if (
        newest !== null &&
        newest !== undefined &&
        typeof newest.timestamp === 'string' &&
        oldest !== null &&
        oldest !== undefined &&
        typeof oldest.timestamp === 'string'
      ) {
        const latestTime = safeParseHex(newest.timestamp);
        const oldestTime = safeParseHex(oldest.timestamp);
        const diffBlocks = latest12Blocks.length - 1;
        if (diffBlocks > 0 && latestTime > 0 && oldestTime > 0) {
          blockTime = (latestTime - oldestTime) / diffBlocks;
        }
      }
    }

    return {
      isOnline: true,
      height,
      blockTime,
      transactions: totalTxs,
      activeAddresses: activeAddrs.size,
      difficulty: latest12Blocks[0]
        ? safeParseHex(latest12Blocks[0].difficulty)
        : 0,
      blocks: latest12Blocks.map((b) => ({
        number: safeParseHex(b.number),
        hash: b.hash || '',
        miner: b.miner || '',
        timestamp: safeParseHex(b.timestamp),
        txCount:
          b.transactions && Array.isArray(b.transactions)
            ? b.transactions.length
            : 0,
      })),
      coinbase,
    };
  } catch (err) {
    console.error('[insights] Fatal error:', err);
    return { ...OFFLINE_INSIGHTS };
  }
}

export type { ActivityItem, NetworkInsights, InsightBlock };
