import { HISTORY_FILTER_ALL, type HistoryFilter } from '@/store'

interface OwnedWallet {
  address: string
}

/**
 * Resolves the active history filter into the concrete list of lowercased wallet
 * addresses that history queries should target. The 'ALL' sentinel expands to
 * every owned address; a specific address resolves to just that address, but
 * falls back to all owned addresses when the selected wallet is no longer owned.
 * @param filter - The active history filter ('ALL' or a specific address).
 * @param accounts - The wallets currently owned by the user.
 * @returns The lowercased addresses to aggregate history across.
 */
function resolveHistoryAddresses(filter: HistoryFilter, accounts: OwnedWallet[]): string[] {
  const owned = accounts.map((account) => account.address.toLowerCase())
  if (filter === HISTORY_FILTER_ALL) {
    return owned
  }
  const selected = filter.toLowerCase()
  return owned.includes(selected) ? [selected] : owned
}

/**
 * Filters a list of mined blocks down to those whose miner is within the given
 * set of addresses. Used to scope found-block history and counts to the active
 * history filter selection.
 * @param blocks - The mined blocks to filter.
 * @param addresses - The lowercased addresses to keep.
 * @returns The blocks mined by one of the supplied addresses.
 */
function filterFoundBlocks<T extends { miner: string }>(blocks: T[], addresses: string[]): T[] {
  const targets = new Set(addresses.map((address) => address.toLowerCase()))
  return blocks.filter((block) => targets.has(block.miner.toLowerCase()))
}

export { resolveHistoryAddresses, filterFoundBlocks }
