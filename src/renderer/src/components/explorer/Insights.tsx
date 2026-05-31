import type { JSX } from 'react'
import { IconBox, IconClock, IconArrowUp, IconUsers, IconZap } from '@/assets/icons'

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
            <IconBox className="text-blue-500" width={12} height={12} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-slate-600">Chain height</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{height}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Latest</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center">
            <IconClock className="text-indigo-500" width={12} height={12} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-slate-600">Block time</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{blockTime}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Past 100 blocks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center">
            <IconArrowUp className="text-emerald-500" width={12} height={12} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-slate-600">Transactions</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{txs}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Est. past 12 blocks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-amber-50 flex items-center justify-center">
            <IconUsers className="text-amber-500" width={12} height={12} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-slate-600">Active addrs</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{addrs}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Est. past 12 blocks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-fuchsia-50 flex items-center justify-center">
            <IconZap className="text-fuchsia-500" width={12} height={12} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-slate-600">Difficulty</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{diff}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Current</p>
      </div>
    </div>
  )
}
