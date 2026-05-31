import { type ActivityData } from '@/views/Wallet/ActivityItem'

const MOCK_TRANSACTIONS: Record<string, ActivityData[]> = {
  default: [
    {
      id: 'tx1',
      type: 'mining',
      title: 'Mining reward',
      subtitle: 'From mining pool · block #28477',
      amount: '10.00',
      timestampStr: '8s ago · 1 confs'
    },
    {
      id: 'tx2',
      type: 'send',
      title: 'Sent CMU',
      subtitle: 'To 0x8f1a3c...6e5f4a',
      amount: '24.50',
      timestampStr: '4m ago · 8 confs'
    },
    {
      id: 'tx3',
      type: 'mining',
      title: 'Mining reward',
      subtitle: 'From mining pool · block #28473',
      amount: '10.00',
      timestampStr: '7m ago · 5 confs'
    },
    {
      id: 'tx4',
      type: 'contract',
      title: 'Contract call',
      subtitle: 'To 0x4f9d12...a77b88',
      amount: '0.12',
      timestampStr: '22m ago · 44 confs'
    },
    {
      id: 'tx5',
      type: 'receive',
      title: 'Received CMU',
      subtitle: 'From 0xa2c177...cdef00',
      amount: '75.00',
      timestampStr: '1h 12m ago · 144 confs'
    },
    {
      id: 'tx6',
      type: 'send',
      title: 'Sent CMU',
      subtitle: 'To 0x7e8821...9900aa',
      amount: '5.00',
      timestampStr: '3h ago · 432 confs'
    }
  ]
}

/**
 * Retrieves the local transaction history for a given wallet address.
 * Currently uses realistic mock data mimicking a local ledger, pending
 * a full Geth block-scanner implementation.
 * @param address - The wallet address to query.
 * @returns A promise resolving to an array of transaction activities.
 */
export async function getTransactions(address: string): Promise<ActivityData[]> {
  // In a real implementation, this would query electron-store for outgoing txs
  // and scan recent blocks for incoming txs/mining rewards.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRANSACTIONS.default)
    }, 300)
  })
}
