const NATIVE_GRADIENT = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";

const HEX_BYTE_LENGTH = 2;
const COLOR_CHANNEL_MAX = 255;
const HUE_FULL_CIRCLE = 360;
const SATURATION_PERCENT = 70;
const LIGHTNESS_PERCENT = 55;
const LIGHTNESS_SHIFT = 30;

/**
 * Converts an HSL colour description to a CSS hex colour string.
 * @param {any} h - Hue in degrees (0–360).
 * @param {any} s - Saturation as a percentage (0–100).
 * @param {any} l - Lightness as a percentage (0–100).
 * @returns {any} A six-character CSS hex colour string prefixed with '#'.
 */
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);

  const channel = (n: number): string => {
    const k = (n + h / 30) % 12;
    const value = lNorm - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * COLOR_CHANNEL_MAX)
      .toString(16)
      .padStart(HEX_BYTE_LENGTH, "0");
  };

  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/**
 * Produces a deterministic integer hash from an arbitrary string. The algorithm
 * is a standard djb2 variant and is intentionally simple — collisions are
 * acceptable since the output is only used to pick a visual hue.
 * @param {any} input - The string to hash.
 * @returns {any} An unsigned 32-bit integer.
 */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Generates a deterministic CSS `linear-gradient` string from an Ethereum
 * contract address. The two gradient stops are derived by treating the address
 * as a seed: the first stop hue is taken modulo 360, and the second stop is
 * shifted by 30 lightness points to guarantee visible contrast. The native coin
 * sentinel value `'native'` returns a fixed premium blue-to-purple gradient.
 * @param {any} address - The token contract address or the sentinel string `'native'`.
 * @returns {any} A ready-to-use CSS `linear-gradient(...)` string.
 */
export function getTokenGradient(address: string): string {
  if (address === "native") {
    return NATIVE_GRADIENT;
  }

  const seed = hashString(address.toLowerCase());
  const hue = seed % HUE_FULL_CIRCLE;
  const colorA = hslToHex(hue, SATURATION_PERCENT, LIGHTNESS_PERCENT);
  const colorB = hslToHex(
    (hue + LIGHTNESS_SHIFT) % HUE_FULL_CIRCLE,
    SATURATION_PERCENT,
    LIGHTNESS_PERCENT - LIGHTNESS_SHIFT,
  );

  return `linear-gradient(135deg, ${colorA} 0%, ${colorB} 100%)`;
}

/**
 * Derives the display initials from a token symbol. Returns the first two
 * characters when the symbol has more than two characters, otherwise returns
 * the full symbol. The result is always upper-cased.
 * @param {any} symbol - The token ticker symbol (e.g. `'USDC'`, `'ETH'`, `'CMU'`).
 * @returns {any} One or two upper-cased characters suitable for an avatar label.
 */
export function getTokenInitials(symbol: string): string {
  if (!symbol) return "?";
  const upper = symbol.toUpperCase();
  return upper.length > 2 ? upper.slice(0, 2) : upper;
}
