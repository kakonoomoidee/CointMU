interface NetworkInsightBlock {
  number: number
  hash: string
  miner: string
  timestamp: number
  txCount: number
}

interface NetworkInsights {
  isOnline: boolean
  height: number
  blockTime: number
  transactions: number
  activeAddresses: number
  difficulty: number
  blocks: NetworkInsightBlock[]
  coinbase: string
}

/**
 * Fetches aggregated network insights from the main process node bridge.
 * @returns The current network insights payload.
 */
async function getNetworkInsights(): Promise<NetworkInsights> {
  return window.api.network.getInsights()
}

export { getNetworkInsights }
export type { NetworkInsights, NetworkInsightBlock }
