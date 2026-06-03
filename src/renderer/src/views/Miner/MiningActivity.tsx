import { type JSX } from 'react'
import { Card, WalletHistoryFilter, Pagination } from '@/components'
import { IconCheck, IconCube } from '@/assets/icons'
import { formatAge } from '@/utils'
import { type FoundBlock, type HistoryFilter } from '@/store'
import { type DerivedAccount, getYearlyActivity } from '@/services'
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap'
import { MiningActivityLogs } from './MiningActivityLogs'

const SELF_BLOCK_REWARD = '+2.00'

const ACTIVITY_TAB_FOUND = 'Found'
const ACTIVITY_TAB_SHARES = 'Shares'
const ACTIVITY_TAB_LOG = 'Log'
const ACTIVITY_TAB_ACTIVITY = 'Activity'
const ACTIVITY_TABS = [
  ACTIVITY_TAB_FOUND,
  ACTIVITY_TAB_SHARES,
  ACTIVITY_TAB_LOG,
  ACTIVITY_TAB_ACTIVITY
] as const

interface MiningActivityProps {
  activeTab: string
  onTabChange: (tab: string) => void
  minedBlocks: FoundBlock[]
  scopedFoundBlocks: FoundBlock[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  sharesData: Array<boolean | null>
  acceptedShares: number
  networkShares: number
  accounts: DerivedAccount[]
  historyFilter: HistoryFilter
  onFilterChange: (filter: HistoryFilter) => void
}

/**
 * Mining activity card exposing three tabs: blocks the selected wallets have
 * found, a grid of recent accepted shares, and the raw node activity log. The
 * found-block history aggregates across all owned wallets and is scoped by the
 * global wallet history filter, with page controls over the result.
 * @param props - The active tab, tab handler, pagination state, filter state,
 *        owned wallets, and the data for each tab.
 * @returns The rendered mining activity card.
 */
function MiningActivity({
  activeTab,
  onTabChange,
  minedBlocks,
  scopedFoundBlocks,
  currentPage,
  totalPages,
  onPageChange,
  sharesData,
  acceptedShares,
  networkShares,
  accounts,
  historyFilter,
  onFilterChange
}: MiningActivityProps): JSX.Element {
  const yearlyActivity = getYearlyActivity(scopedFoundBlocks)

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Mining activity</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Blocks you found and what the network paid
          </p>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
          {ACTIVITY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === ACTIVITY_TAB_FOUND && (
          <div>
            <div className="flex items-center justify-end mb-2">
              <WalletHistoryFilter
                accounts={accounts}
                value={historyFilter}
                onChange={onFilterChange}
              />
            </div>
            <div className="h-[280px] overflow-y-auto pr-1">
              {minedBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconCube className="text-slate-300 mb-3" width={32} height={32} />
                  <p className="text-sm font-medium text-slate-400">No blocks found yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start mining to find blocks</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {minedBlocks.map((block) => (
                    <div
                      key={block.hash}
                      className="flex items-center justify-between py-4 px-2 hover:bg-slate-50/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                          <IconCheck width={16} height={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              #{block.number.toLocaleString()}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {block.hash.substring(0, 6)}...{block.hash.substring(block.hash.length - 4)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{formatAge(block.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-500 tracking-tight">
                          {SELF_BLOCK_REWARD}
                        </span>
                        <span className="text-xs font-medium text-emerald-500/70 ml-1">CMU</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}

        {activeTab === ACTIVITY_TAB_SHARES && (
          <div className="flex flex-col h-[280px]">
            <p className="text-[11px] font-semibold text-slate-500 mb-3">
              Accepted shares - last 14 minutes
            </p>
            <div className="flex-1 flex flex-wrap gap-1.5 content-start">
              {sharesData.map((status, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-sm ${
                    status === true ? 'bg-green-500' : status === false ? 'bg-green-200' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-medium text-slate-500">
                <span className="font-bold text-slate-800">{acceptedShares}</span> shares accepted -{' '}
                <span className="font-bold text-slate-800">{networkShares}</span> evaluated
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 mr-1">Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-100" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-[10px] text-slate-400 ml-1">More</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === ACTIVITY_TAB_LOG && <MiningActivityLogs />}

        {activeTab === ACTIVITY_TAB_ACTIVITY && (
          <div className="py-2">
            <p className="text-[11px] font-semibold text-slate-500 mb-3">Last 365 days</p>
            <ActivityHeatmap contributions={yearlyActivity} />
          </div>
        )}
      </div>
    </Card>
  )
}

export { MiningActivity, ACTIVITY_TAB_FOUND }
export type { MiningActivityProps }
