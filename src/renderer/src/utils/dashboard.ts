const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const CMU_PER_MINED_BLOCK = 10

/**
 * Formats a unix timestamp as a coarse relative age string using seconds,
 * minutes, or an hours-and-minutes breakdown.
 * @param timestamp - The unix timestamp in seconds.
 * @returns A human-readable relative age label.
 */
export function formatRelativeAge(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000) - timestamp
  if (diff < SECONDS_PER_MINUTE) {
    return `${diff} secs ago`
  }
  if (diff < SECONDS_PER_HOUR) {
    return `${Math.floor(diff / SECONDS_PER_MINUTE)} min ago`
  }
  const hours = Math.floor(diff / SECONDS_PER_HOUR)
  const minutes = Math.floor((diff % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  return `${hours}h ${minutes}m ago`
}

/**
 * Derives the approximate number of self-mined blocks implied by a balance,
 * assuming a fixed reward per mined block.
 * @param balance - The comma-grouped balance string.
 * @returns The estimated mined block count, or 0 when the balance is invalid.
 */
export function computeMinedBlocksCount(balance: string): number {
  const parsed = parseFloat(balance.replace(/,/g, ''))
  return isNaN(parsed) ? 0 : Math.floor(parsed / CMU_PER_MINED_BLOCK)
}
