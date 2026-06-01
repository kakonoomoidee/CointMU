import { type JSX } from 'react'
import { ActivityItem, type ActivityData } from '@/views/Wallet/ActivityItem'
import { WalletHistoryFilter, Pagination } from '@/components'
import { IconChevronRight, IconClock } from '@/assets/icons'
import { downloadActivityCsv } from '@/utils'
import { type DerivedAccount } from '@/services'
import { type HistoryFilter } from '@/store'

const ACTIVITY_CSV_FILENAME = 'cointmu-activity.csv'

interface ActivityFeedProps {
  isConnected: boolean
  activity: ActivityData[]
  pageItems: ActivityData[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  accounts: DerivedAccount[]
  historyFilter: HistoryFilter
  onFilterChange: (filter: HistoryFilter) => void
}

/**
 * Activity feed panel listing the aggregated transaction history for the wallets
 * selected by the global history filter. It renders the current page of records,
 * a wallet filter dropdown, page controls, and a CSV export of the full
 * fetched dataset.
 * @param props - Connection state, the full and paginated records, pagination
 *        state and handler, the owned wallets, and the filter value and handler.
 * @returns The rendered activity feed panel.
 */
function ActivityFeed({
  isConnected,
  activity,
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  accounts,
  historyFilter,
  onFilterChange
}: ActivityFeedProps): JSX.Element {
  const hasActivity = isConnected && activity.length > 0

  /**
   * Exports the full fetched activity history to a CSV download.
   */
  const handleExport = (): void => downloadActivityCsv(activity, ACTIVITY_CSV_FILENAME)

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800">Your activity</h3>
        <button
          onClick={handleExport}
          disabled={!hasActivity}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export
          <IconChevronRight width={10} height={10} strokeWidth={3} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-slate-400 font-mono">Aggregated transaction history</p>
        <WalletHistoryFilter accounts={accounts} value={historyFilter} onChange={onFilterChange} />
      </div>

      <div className="space-y-0">
        {hasActivity ? (
          <>
            <div className="divide-y divide-slate-100 -mx-2">
              {pageItems.map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center">
            <IconClock className="text-slate-300 mb-2" width={28} height={28} strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-400">No activity yet</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Start mining to see rewards</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { ActivityFeed }
export type { ActivityFeedProps }
