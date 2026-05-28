import { ethers } from 'ethers'

const RPC_PROTOCOL = 'http'
const PROVIDER_TIMEOUT_MS = 10000

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

export { createProvider, resetProvider, getBlockNumber, getChainId, getPeerCount, getSyncStatus }
