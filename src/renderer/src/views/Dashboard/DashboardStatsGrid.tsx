import { type JSX } from 'react'

interface DashboardStatsGridProps {
  isConnected: boolean
  miningLabel: string
  miningUptimeLabel: string
  minedBlocksCount: number
  hashrateDisplay: string
}

/**
 * Four-column KPI grid summarizing the user's mining status, mined blocks over
 * the last day, the network hashrate, and deployed smart contracts.
 * @param props - Connection state and the formatted KPI display values.
 * @returns The rendered dashboard stats grid.
 */
function DashboardStatsGrid({
  isConnected,
  miningLabel,
  miningUptimeLabel,
  minedBlocksCount,
  hashrateDisplay
}: DashboardStatsGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg
                className="text-blue-500"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Your mining</span>
          </div>
          <button className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-0.5">
            Open
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
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{miningLabel}</p>
        <p className="text-xs text-slate-400 mt-1">{miningUptimeLabel}</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <svg
              className="text-emerald-500"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500">Mined blocks (24h)</span>
        </div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">
          {isConnected ? minedBlocksCount : '0'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {isConnected ? `+${minedBlocksCount * 10} CMU rewards` : '--'}
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <svg
              className="text-violet-500"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500">Network hashrate</span>
        </div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{hashrateDisplay}</p>
        <p className="text-xs text-slate-400 mt-1">{isConnected ? 'Real-time via RPC' : '--'}</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <svg
              className="text-amber-500"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500">Smart contracts</span>
        </div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">0</p>
        <p className="text-xs text-slate-400 mt-1">{isConnected ? '0 deployed by you' : '--'}</p>
      </div>
    </div>
  )
}

export { DashboardStatsGrid }
export type { DashboardStatsGridProps }
