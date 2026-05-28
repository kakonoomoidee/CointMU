const LOCALE_DEFAULT = 'en-US'
const PORT_DISPLAY_PREFIX = ':'
const PEER_SINGULAR = 'peer'
const PEER_PLURAL = 'peers'
const BLOCK_HASH_PREVIEW_LENGTH = 10
const ZERO_DISPLAY = '0'

/**
 * Formats a block number into a locale-aware string with thousands separators.
 * @param blockNumber - The raw block number, or null if unavailable.
 * @returns A formatted string representation of the block number.
 */
function formatBlockNumber(blockNumber: number | null): string {
  if (blockNumber === null) {
    return '--'
  }
  return blockNumber.toLocaleString(LOCALE_DEFAULT)
}

/**
 * Formats an RPC port number into a display string with prefix colon.
 * @param port - The port number, or null if not yet resolved.
 * @returns A formatted port display string.
 */
function formatPortDisplay(port: number | null): string {
  if (port === null) {
    return '--'
  }
  return `${PORT_DISPLAY_PREFIX}${port}`
}

/**
 * Formats a peer count with the correct singular or plural label.
 * @param count - The number of connected peers, or null if unavailable.
 * @returns A formatted peer count string.
 */
function formatPeerCount(count: number | null): string {
  if (count === null) {
    return '--'
  }
  const label = count === 1 ? PEER_SINGULAR : PEER_PLURAL
  return `${count} ${label}`
}

/**
 * Formats a chain ID bigint into a human-readable decimal string.
 * @param chainId - The chain ID as a bigint, or null if unavailable.
 * @returns A string representation of the chain ID.
 */
function formatChainId(chainId: bigint | null): string {
  if (chainId === null) {
    return '--'
  }
  return chainId.toString()
}

/**
 * Formats a timestamp into a locale-aware time string.
 * @param timestamp - Unix timestamp in milliseconds, or null.
 * @returns A formatted time string (HH:MM:SS).
 */
function formatTimestamp(timestamp: number | null): string {
  if (timestamp === null) {
    return '--:--:--'
  }
  return new Date(timestamp).toLocaleTimeString(LOCALE_DEFAULT)
}

export { formatBlockNumber, formatPortDisplay, formatPeerCount, formatChainId, formatTimestamp }
