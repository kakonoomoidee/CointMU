import { useState, useEffect, useMemo, type JSX } from 'react'
import { getAddressSummary, generateIdenticonGradient, type DerivedAccount } from '@/services'
import { getTransactions } from '@/services/transactionService'
import { usePagination } from '@/hooks'
import { formatTxAge } from '@/utils'
import { Sparkline, Pagination } from '@/components'
import { IconChevronLeft, IconFile, IconChevronRight } from '@/assets/icons'
import { AddressBadge } from './AddressBadge'
import { type ActivityData } from '@/views/Wallet/ActivityItem'

interface AddressDetailProps {
  address: string
  accounts: DerivedAccount[]
  onBack: () => void
  onAddressSelect: (address: string) => void
  onTxHashSelect: (hash: string) => void
}

const ADDRESS_TX_PAGE_SIZE = 8
const MOCK_USD_RATE = 0.42
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000


/**
 * Address detail view presenting the balance, ownership and account-type badges,
 * a recent-window transaction summary, an illustrative balance-trend chart, and a
 * paginated list of recent transactions involving the address. Summary counts and
 * first/last seen are derived from the recent block-scan window, not full history.
 * @param props - The address, owned accounts, and navigation handlers.
 * @returns The rendered address detail view.
 */
function AddressDetail({
  address,
  accounts,
  onBack,
  onAddressSelect,
  onTxHashSelect
}: AddressDetailProps): JSX.Element {
  const [balance, setBalance] = useState<string>('0.00')
  const [isContract, setIsContract] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const load = async (): Promise<void> => {
      const [summary, txs] = await Promise.all([
        getAddressSummary(address),
        getTransactions([address])
      ])
      if (!mounted) {
        return
      }
      setBalance(summary.balance)
      setIsContract(summary.isContract)
      setTransactions(txs)
      setLoading(false)
    }

    load()
    return (): void => {
      mounted = false
    }
  }, [address])

  const chartData = useMemo(() => {
    const currentBalance = parseFloat(balance.replace(/,/g, '')) || 0
    const points: number[] = [currentBalance]
    let runningBal = currentBalance

    for (const tx of transactions) {
      const txAmount = parseFloat(String(tx.amount).replace(/,/g, '')) || 0
      
      if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
        runningBal -= txAmount
      } else if (tx.from && tx.from.toLowerCase() === address.toLowerCase()) {
        runningBal += txAmount 
      }
      points.push(runningBal)
    }

    points.reverse()

    const padding = Array(30).fill(points[0] || 0)
    const paddedPoints = [...padding, ...points]

    if (paddedPoints.length < 2) {
      paddedPoints.push(paddedPoints[0] || 0)
    }
    
    return paddedPoints
  }, [balance, transactions, address])

  const pagination = usePagination(transactions, ADDRESS_TX_PAGE_SIZE)

  const isOwned = accounts.some((account) => account.address.toLowerCase() === address.toLowerCase())
  const parsedBalance = parseFloat(balance.replace(/,/g, '')) || 0
  const approxUsd = (parsedBalance * MOCK_USD_RATE).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const pastWeekCount = transactions.filter(
    (tx) => Date.now() - tx.timestamp * 1000 <= MS_PER_WEEK
  ).length
  const blockNumbers = transactions
    .map((tx) => tx.blockNumber)
    .filter((value): value is number => typeof value === 'number')
  const firstSeen = blockNumbers.length > 0 ? Math.min(...blockNumbers) : null
  const lastSeen = blockNumbers.length > 0 ? Math.max(...blockNumbers) : null

  const abbrAddress = `${address.substring(0, 10)}...${address.substring(address.length - 8)}`

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <IconChevronLeft width={12} height={12} strokeWidth={2.5} />
            Back
          </button>
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-0.5">
              Address
            </p>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight font-mono">
              {abbrAddress}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwned && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              Your wallet
            </span>
          )}
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {isContract ? 'Contract' : 'EOA'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br ${generateIdenticonGradient(address)}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-mono text-slate-700 truncate" title={address}>
                {address}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Balance</span>
              <span className="text-lg font-bold text-slate-800">
                {balance} <span className="text-sm font-medium text-slate-400">CMU</span>
                <span className="text-xs font-medium text-slate-400 ml-2">{'≈'} ${approxUsd}</span>
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Transactions</span>
              <span className="text-sm font-semibold text-slate-800">
                {transactions.length} recent {'·'} {pastWeekCount} in past week
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">First seen</span>
              <span className="text-sm font-semibold text-slate-800">
                {firstSeen !== null ? `Block #${firstSeen}` : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Last seen</span>
              <span className="text-sm font-semibold text-slate-800">
                {lastSeen !== null ? `Block #${lastSeen}` : '--'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Derived from the recent block window</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-4">
            Balance Trend {'·'} 30D
          </p>
          <div className="flex-1 min-h-[120px]">
            <Sparkline
              data={chartData}
              className="w-full h-full text-blue-500"
              color="#3b82f6"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-slate-400">30 days ago</span>
            <span className="text-[10px] text-slate-400">Today</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Recent transactions</h3>
        <p className="text-[10px] text-slate-400 mb-5">
          Showing {pagination.pageItems.length} of {transactions.length} (recent window)
        </p>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-400">No recent transactions found</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Hash</th>
                  <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">From</th>
                  <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">To</th>
                  <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Amount</th>
                  <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagination.pageItems.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                          <IconFile width={10} height={10} />
                        </div>
                        {tx.hash ? (
                          <span
                            className="text-xs font-mono text-blue-600 cursor-pointer hover:underline"
                            onClick={() => onTxHashSelect(tx.hash as string)}
                          >
                            {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">{tx.title}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <AddressBadge address={tx.from ?? null} leftAligned onClick={onAddressSelect} />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1">
                        <IconChevronRight className="text-slate-300 flex-shrink-0" width={12} height={12} />
                        <AddressBadge address={tx.to ?? null} leftAligned onClick={onAddressSelect} />
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span className="text-xs font-bold text-slate-800">{tx.amount} CMU</span>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <div className="flex flex-col items-end whitespace-nowrap">
                        <span className="text-[10px] text-slate-700 font-medium">{formatTxAge(tx.timestamp)}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{tx.timestampStr}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

export { AddressDetail }
export type { AddressDetailProps }
