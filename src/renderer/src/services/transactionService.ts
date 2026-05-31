import { type ActivityData } from '@/views/Wallet/ActivityItem'

/**
 * Retrieves the local transaction history for a given wallet address.
 * Currently uses realistic mock data mimicking a local ledger, pending
 * a full Geth block-scanner implementation.
 * @param address - The wallet address to query.
 * @returns A promise resolving to an array of transaction activities.
 */
export async function getTransactions(address: string): Promise<ActivityData[]> {
  if (!address) return []
  try {
    return await window.api.wallet.getActivity(address)
  } catch (error) {
    console.error('Failed to get transactions from IPC:', error)
    return []
  }
}
