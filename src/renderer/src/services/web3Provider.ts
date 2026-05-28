import { ethers } from 'ethers'

const RPC_PROTOCOL = 'http'

let providerInstance: ethers.JsonRpcProvider | null = null

/**
 * Creates or returns a cached ethers.js JsonRpcProvider connected to the local
 * Core-geth RPC endpoint at the given port.
 * @param port - The dynamically resolved RPC port number.
 * @param host - The RPC host address, defaults to localhost.
 * @returns A configured JsonRpcProvider instance.
 */
function createProvider(port: number, host: string = '127.0.0.1'): ethers.JsonRpcProvider {
  const rpcUrl = `${RPC_PROTOCOL}://${host}:${port}`

  if (providerInstance) {
    return providerInstance
  }

  providerInstance = new ethers.JsonRpcProvider(rpcUrl, undefined, {
    staticNetwork: true,
    batchMaxCount: 1
  })

  return providerInstance
}

/**
 * Destroys the cached provider instance, forcing a fresh connection on next call.
 */
function resetProvider(): void {
  if (providerInstance) {
    providerInstance.destroy()
    providerInstance = null
  }
}

/**
 * Fetches the latest block number from the connected node.
 * @param provider - An active JsonRpcProvider instance.
 * @returns The latest block number, or null if the request fails.
 */
async function getBlockNumber(provider: ethers.JsonRpcProvider): Promise<number | null> {
  try {
    return await provider.getBlockNumber()
  } catch {
    return null
  }
}

/**
 * Fetches the chain ID from the connected node.
 * @param provider - An active JsonRpcProvider instance.
 * @returns The chain ID as a bigint, or null if the request fails.
 */
async function getChainId(provider: ethers.JsonRpcProvider): Promise<bigint | null> {
  try {
    const network = await provider.getNetwork()
    return network.chainId
  } catch {
    return null
  }
}

/**
 * Fetches the current peer count via direct RPC call.
 * @param provider - An active JsonRpcProvider instance.
 * @returns The number of connected peers, or null if the request fails.
 */
async function getPeerCount(provider: ethers.JsonRpcProvider): Promise<number | null> {
  try {
    const result = await provider.send('net_peerCount', [])
    return parseInt(result, 16)
  } catch {
    return null
  }
}

/**
 * Checks whether the node is currently syncing.
 * @param provider - An active JsonRpcProvider instance.
 * @returns A syncing status object, false if fully synced, or null on failure.
 */
async function getSyncStatus(
  provider: ethers.JsonRpcProvider
): Promise<boolean | Record<string, string> | null> {
  try {
    return await provider.send('eth_syncing', [])
  } catch {
    return null
  }
}

const DEFAULT_MINING_THREADS = 1
const HEX_RADIX = 16

/**
 * Sends an RPC command to start the miner on the connected node.
 * @param provider - An active JsonRpcProvider instance.
 * @param threads - The number of mining threads to use, defaults to one.
 * @returns True if the command was acknowledged, or null on failure.
 */
async function startMining(
  provider: ethers.JsonRpcProvider,
  threads: number = DEFAULT_MINING_THREADS
): Promise<boolean | null> {
  try {
    return await provider.send('miner_start', [threads])
  } catch {
    return null
  }
}

/**
 * Sends an RPC command to stop the miner on the connected node.
 * @param provider - An active JsonRpcProvider instance.
 * @returns True if the command was acknowledged, or null on failure.
 */
async function stopMining(provider: ethers.JsonRpcProvider): Promise<boolean | null> {
  try {
    return await provider.send('miner_stop', [])
  } catch {
    return null
  }
}

/**
 * Queries the node to determine if the miner is currently active.
 * @param provider - An active JsonRpcProvider instance.
 * @returns True if actively mining, false if idle, or null on failure.
 */
async function getMiningStatus(provider: ethers.JsonRpcProvider): Promise<boolean | null> {
  try {
    return await provider.send('eth_mining', [])
  } catch {
    return null
  }
}

/**
 * Fetches the current mining hashrate from the connected node.
 * @param provider - An active JsonRpcProvider instance.
 * @returns The hashrate in hashes per second, or null on failure.
 */
async function getHashrate(provider: ethers.JsonRpcProvider): Promise<number | null> {
  try {
    const result = await provider.send('eth_hashrate', [])
    return parseInt(result, HEX_RADIX)
  } catch {
    return null
  }
}

export {
  createProvider,
  resetProvider,
  getBlockNumber,
  getChainId,
  getPeerCount,
  getSyncStatus,
  startMining,
  stopMining,
  getMiningStatus,
  getHashrate
}
