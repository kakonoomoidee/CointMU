import { type JSX } from 'react'
import { ActivityItem, type ActivityData } from '@/views/Wallet/ActivityItem'
import { downloadActivityCsv } from '@/utils'

const ACTIVITY_CSV_FILENAME = 'cointmu-activity.csv'
const MAX_VISIBLE_ACTIVITY = 10

interface ActivityFeedProps {
  isConnected: boolean
  activity: ActivityData[]
  abbrAddress: string
}

/**
 * Activity feed panel listing the active wallet's recent transactions and
 * exposing a CSV export of the full fetched history.
 * @param props - Connection state, the activity records, and the address label.
 * @returns The rendered activity feed panel.
 */
function ActivityFeed({ isConnected, activity, abbrAddress }: ActivityFeedProps): JSX.Element {
  const hasActivity = isConnected && activity.length > 0

  /**
   * Exports the currently fetched activity history to a CSV download.
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
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mb-4 font-mono">Transactions for {abbrAddress}</p>

      <div className="space-y-0">
        {hasActivity ? (
          <div className="divide-y divide-slate-100 -mx-2">
            {activity.slice(0, MAX_VISIBLE_ACTIVITY).map((item) => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center">
            <svg
              className="text-slate-300 mb-2"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
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
