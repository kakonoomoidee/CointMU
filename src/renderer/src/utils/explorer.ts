const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const ASCII_PRINTABLE_MIN = 0
const ASCII_PRINTABLE_MAX = 127
const HEX_RADIX = 16
const HEX_CHARS_PER_BYTE = 2

/**
 * Formats a unix timestamp as a coarse relative age string for explorer tables,
 * using seconds, minutes, or hours.
 * @param timestamp - The unix timestamp in seconds.
 * @returns A human-readable relative age label.
 */
export function formatTxAge(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000) - timestamp
  if (diff < 0) {
    return 'Just now'
  }
  if (diff < SECONDS_PER_MINUTE) {
    return `${diff} secs ago`
  }
  if (diff < SECONDS_PER_HOUR) {
    return `${Math.floor(diff / SECONDS_PER_MINUTE)} mins ago`
  }
  return `${Math.floor(diff / SECONDS_PER_HOUR)} hrs ago`
}

/**
 * Decodes a hex string into its printable ASCII representation, skipping any
 * bytes that fall outside the printable ASCII range.
 * @param hex - The hex string, with or without a leading 0x prefix.
 * @returns The decoded printable ASCII string.
 */
export function hexToAscii(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  let str = ''
  for (let i = 0; i < cleaned.length; i += HEX_CHARS_PER_BYTE) {
    const charCode = parseInt(cleaned.substr(i, HEX_CHARS_PER_BYTE), HEX_RADIX)
    if (charCode > ASCII_PRINTABLE_MIN && charCode < ASCII_PRINTABLE_MAX) {
      str += String.fromCharCode(charCode)
    }
  }
  return str
}
