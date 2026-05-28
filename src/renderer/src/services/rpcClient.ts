const RPC_HOST = '127.0.0.1'
const RPC_PROTOCOL = 'http'
const JSON_RPC_VERSION = '2.0'
const HEX_RADIX = 16
const WEI_PER_GWEI = 1_000_000_000

let requestCounter = 0

/**
 * Constructs the full JSON-RPC endpoint URL for the given port.
 * @param port - The dynamically resolved RPC port.
 * @returns The fully qualified HTTP URL string.
 */
function buildEndpoint(port: number): string {
  return `${RPC_PROTOCOL}://${RPC_HOST}:${port}`
}

/**
 * Performs a single JSON-RPC 2.0 call to the local Core-geth node using the
 * native Fetch API. Returns the raw `result` field from the response, or null
 * if the node is unreachable or the call produces an error.
 * @param port - The RPC port the local node is listening on.
 * @param method - The JSON-RPC method name (e.g. 'eth_blockNumber').
 * @param params - The ordered parameter array for the method.
 * @returns The raw result value from the JSON-RPC response, or null on failure.
 */
async function call(port: number, method: string, params: any[] = []): Promise<any> {
  requestCounter += 1

  const body = JSON.stringify({
    jsonrpc: JSON_RPC_VERSION,
    method,
    params,
    id: requestCounter
  })

  try {
    const response = await fetch(buildEndpoint(port), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })

    if (!response.ok) {
      return null
    }

    const json = await response.json()

    if (json.error) {
      return null
    }

    return json.result
  } catch {
    return null
  }
}

/**
 * Fetches the latest block number from the node and converts the hex result
 * to a decimal integer.
 * @param port - The RPC port.
 * @returns The block height as a number, or null on failure.
 */
async function fetchBlockNumber(port: number): Promise<number | null> {
  const result = await call(port, 'eth_blockNumber')
  if (result === null) return null
  return parseInt(result, HEX_RADIX)
}

/**
 * Fetches the connected peer count and converts the hex result to a decimal integer.
 * @param port - The RPC port.
 * @returns The peer count as a number, or null on failure.
 */
async function fetchPeerCount(port: number): Promise<number | null> {
  const result = await call(port, 'net_peerCount')
  if (result === null) return null
  return parseInt(result, HEX_RADIX)
}

/**
 * Fetches the current suggested gas price and converts the hex wei result
 * to a human-readable gwei string.
 * @param port - The RPC port.
 * @returns The gas price in gwei as a formatted string, or null on failure.
 */
async function fetchGasPrice(port: number): Promise<string | null> {
  const result = await call(port, 'eth_gasPrice')
  if (result === null) return null
  const wei = parseInt(result, HEX_RADIX)
  const gwei = Math.round(wei / WEI_PER_GWEI)
  return gwei.toString()
}

/**
 * Queries the node to check whether the internal miner is active.
 * @param port - The RPC port.
 * @returns True if mining, false if idle, or null on failure.
 */
async function fetchMiningStatus(port: number): Promise<boolean | null> {
  return await call(port, 'eth_mining')
}

/**
 * Fetches the current mining hashrate and converts the hex result to a
 * decimal integer representing hashes per second.
 * @param port - The RPC port.
 * @returns The hashrate in H/s, or null on failure.
 */
async function fetchHashrate(port: number): Promise<number | null> {
  const result = await call(port, 'eth_hashrate')
  if (result === null) return null
  return parseInt(result, HEX_RADIX)
}

/**
 * Fetches the current network difficulty and converts the hex result
 * to a decimal integer.
 * @param port - The RPC port.
 * @returns The difficulty as a number, or null on failure.
 */
async function fetchDifficulty(port: number): Promise<number | null> {
  const result = await call(port, 'eth_getBlockByNumber', ['latest', false])
  if (result === null || result.difficulty === undefined) return null
  return parseInt(result.difficulty, HEX_RADIX)
}

export {
  call,
  fetchBlockNumber,
  fetchPeerCount,
  fetchGasPrice,
  fetchMiningStatus,
  fetchHashrate,
  fetchDifficulty
}
