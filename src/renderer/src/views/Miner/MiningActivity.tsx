import { type JSX } from 'react'
import ms from 'ms'
import { subDays, format, differenceInMinutes } from 'date-fns'
import { Card, WalletHistoryFilter, Pagination } from '@/components'
import { IconCheck, IconCube } from '@/assets/icons'
import { formatAge } from '@/utils'
import { type FoundBlock, type HistoryFilter } from '@/store'
import { type DerivedAccount } from '@/services'
import { MiningActivityLogs } from './MiningActivityLogs'

const SELF_BLOCK_REWARD = '+2.00'
const ACTIVITY_WINDOW_MS = ms('30d')
const ACTIVITY_WINDOW_DAYS = 30
const SECONDS_TO_MS = 1000

const ACTIVITY_TAB_FOUND = 'Found'
const ACTIVITY_TAB_LOG = 'Log'
const ACTIVITY_TAB_ACTIVITY = 'Activity'
const ACTIVITY_TABS = [
  ACTIVITY_TAB_FOUND,
  ACTIVITY_TAB_LOG,
  ACTIVITY_TAB_ACTIVITY,
] as const

interface DayContribution {
  date: string
  count: number
}

interface MiningActivityProps {
  activeTab: string
  onTabChange: (tab: string) => void
  minedBlocks: FoundBlock[]
  scopedFoundBlocks: FoundBlock[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  accounts: DerivedAccount[]
  historyFilter: HistoryFilter
  onFilterChange: (filter: HistoryFilter) => void
}

/**
 * Builds a contribution series covering strictly the last 30 calendar days.
 * Days with at least one block count as 'accepted'; days with zero count as
 * 'rejected'. The series is ordered oldest to newest.
 * @param blocks - The subset of found blocks within the 30-day window.
 * @returns An ordered array of 30 day-contribution records.
 */
function buildMonthContributions(blocks: FoundBlock[]): DayContribution[] {
  const countsByDate = new Map<string, number>()
  for (const block of blocks) {
    const key = format(new Date(block.timestamp * SECONDS_TO_MS), 'yyyy-MM-dd')
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1)
  }
  const today = new Date()
  const contributions: DayContribution[] = []
  for (let offset = ACTIVITY_WINDOW_DAYS - 1; offset >= 0; offset--) {
    const date = format(subDays(today, offset), 'yyyy-MM-dd')
    contributions.push({ date, count: countsByDate.get(date) ?? 0 })
  }
  return contributions
}

/**
 * Returns the Tailwind background class for a single day cell based on the
 * number of blocks found that day.
 * @param count - The number of blocks found on a given day.
 * @returns The Tailwind background class string.
 */
function cellClass(count: number): string {
  if (count <= 0) return 'bg-slate-100'
  if (count <= 2) return 'bg-green-200'
  if (count <= 5) return 'bg-green-400'
  return 'bg-green-600'
}

/**
 * Mining activity card exposing three tabs: blocks the selected wallets have
 * found, the raw node activity log, and a compact 30-day contribution graph.
 * The graph header shows elapsed time since the most recent block, and the
 * footer tallies accepted versus rejected days across the 30-day window.
 * @param props - The active tab, tab handler, pagination state, filter state,
 *        owned wallets, and the block data for each tab.
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
  accounts,
  historyFilter,
  onFilterChange,
}: MiningActivityProps): JSX.Element {
  const cutoff = Date.now() - ACTIVITY_WINDOW_MS
  const recentBlocks = scopedFoundBlocks.filter(
    (block) => block.timestamp * SECONDS_TO_MS >= cutoff
  )

  const contributions = buildMonthContributions(recentBlocks)
  const acceptedDays = contributions.filter((d) => d.count > 0).length
  const rejectedDays = ACTIVITY_WINDOW_DAYS - acceptedDays

  const latestBlock = recentBlocks.length > 0
    ? recentBlocks.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
    : null
  const minutesSinceLast = latestBlock
    ? differenceInMinutes(Date.now(), latestBlock.timestamp * SECONDS_TO_MS)
    : null

  return (
    <Card>
      <div className='flex items-center justify-between mb-1'>
        <div>
          <h3 className='text-sm font-bold text-slate-800'>Mining activity</h3>
          <p className='text-[10px] text-slate-400 mt-0.5'>
            Blocks you found and what the network paid
          </p>
        </div>
        <div className='relative z-10 flex items-center rounded-lg border border-slate-200 overflow-hidden'>
          {ACTIVITY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className='mt-4'>
        {activeTab === ACTIVITY_TAB_FOUND && (
          <div>
            <div className='flex mb-2'>
              <WalletHistoryFilter
                accounts={accounts}
                value={historyFilter}
                onChange={onFilterChange}
                className='ml-auto w-48'
                compact
              />
            </div>
            <div className='relative z-0 h-[280px] overflow-y-auto pr-1'>
              {minedBlocks.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <IconCube
                    className='text-slate-300 mb-3'
                    width={32}
                    height={32}
                  />
                  <p className='text-sm font-medium text-slate-400'>
                    No blocks found yet
                  </p>
                  <p className='text-xs text-slate-400 mt-1'>
                    Start mining to find blocks
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-slate-100'>
                  {minedBlocks.map((block) => (
                    <div
                      key={block.hash}
                      className='flex items-center justify-between py-4 px-2 hover:bg-slate-50/50 rounded-lg transition-colors'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500'>
                          <IconCheck width={16} height={16} />
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-slate-800'>
                              #{block.number.toLocaleString()}
                            </span>
                            <span className='text-xs font-mono text-slate-400'>
                              {block.hash.substring(0, 6)}...
                              {block.hash.substring(block.hash.length - 4)}
                            </span>
                          </div>
                          <p className='text-xs text-slate-500 mt-0.5'>
                            {formatAge(block.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <span className='font-bold text-emerald-500 tracking-tight'>
                          {SELF_BLOCK_REWARD}
                        </span>
                        <span className='text-xs font-medium text-emerald-500/70 ml-1'>
                          CMU
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}

        {activeTab === ACTIVITY_TAB_LOG && <MiningActivityLogs />}

        {activeTab === ACTIVITY_TAB_ACTIVITY && (
          <div className='py-2'>
            <p className='text-[11px] font-semibold text-slate-500 mb-3'>
              {minutesSinceLast !== null
                ? `Accepted shares · last ${minutesSinceLast} minute${minutesSinceLast === 1 ? '' : 's'}`
                : 'Accepted shares · no activity in the last 30 days'}
            </p>

            <div className='flex flex-wrap gap-1.5'>
              {contributions.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} block${day.count === 1 ? '' : 's'}`}
                  className={`w-4 h-4 rounded-sm ${cellClass(day.count)}`}
                />
              ))}
            </div>

            <div className='flex items-center justify-between mt-4 pt-4 border-t border-slate-100'>
              <p className='text-[11px] font-medium text-slate-500'>
                <span className='font-bold text-emerald-600'>{acceptedDays}</span>
                {' shares accepted · '}
                <span className='font-bold text-red-500'>{rejectedDays}</span>
                {' rejected'}
              </p>
              <div className='flex items-center gap-1.5'>
                <span className='text-[10px] text-slate-400 mr-1'>Less</span>
                <div className='w-3 h-3 rounded-sm bg-slate-100' />
                <div className='w-3 h-3 rounded-sm bg-green-200' />
                <div className='w-3 h-3 rounded-sm bg-green-400' />
                <div className='w-3 h-3 rounded-sm bg-green-600' />
                <span className='text-[10px] text-slate-400 ml-1'>More</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export { MiningActivity, ACTIVITY_TAB_FOUND }
export type { MiningActivityProps }
