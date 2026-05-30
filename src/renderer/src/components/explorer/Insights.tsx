import type { JSX } from 'react'

interface InsightsProps {
  insights: {
    isOnline: boolean
    height: number
    blockTime: number
    transactions: number
    activeAddresses: number
    difficulty: number
  } | null
}

function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k'
  return num.toString()
}

/**
 * Insights component displaying 5 top-level KPI cards for the blockchain.
 * Uses real-time polled data from the local RPC node.
 * @param {InsightsProps} props - The network insights data.
 * @returns {JSX.Element} The rendered Insights row.
 */
export function Insights({ insights }: InsightsProps): JSX.Element {
  const isOnline = insights?.isOnline ?? false
  const height = isOnline && insights ? insights.height.toLocaleString() : 'Offline'
  const blockTime = isOnline && insights ? `${insights.blockTime.toFixed(1)}s` : '--'
  const txs = isOnline && insights ? formatLargeNumber(insights.transactions) : '--'
  const addrs = isOnline && insights ? formatLargeNumber(insights.activeAddresses) : '--'
  const diff = isOnline && insights ? formatLargeNumber(insights.difficulty) : '--'

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
            <svg className="text-blue-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-600">Chain height</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{height}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Latest</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center">
            <svg className="text-indigo-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-600">Block time</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{blockTime}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Past 100 blocks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center">
            <svg className="text-emerald-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-600">Transactions</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{txs}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Est. past 12 blocks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-amber-50 flex items-center justify-center">
            <svg className="text-amber-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-600">Active addrs</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{addrs}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Est. past 12 blocks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-fuchsia-50 flex items-center justify-center">
            <svg className="text-fuchsia-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-600">Difficulty</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{diff}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Current</p>
      </div>
    </div>
  )
}
