import { type JSX } from 'react'
import { IconActivity, IconChevronRight, IconGrid, IconGlobe, IconLink } from '@/assets/icons'

interface DashboardStatsGridProps {
  isConnected: boolean
  miningLabel: string
  miningUptimeLabel: string
  minedBlocksCount: number
  hashrateDisplay: string
  onNavigate: (view: string) => void
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
  hashrateDisplay,
  onNavigate
}: DashboardStatsGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <IconActivity className="text-blue-500 w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-500">Your mining</span>
          </div>
          <button 
            onClick={() => onNavigate('miner')}
            className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-0.5"
          >
            Open
            <IconChevronRight className="w-2.5 h-2.5" strokeWidth={3} />
          </button>
        </div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{miningLabel}</p>
        <p className="text-xs text-slate-400 mt-1">{miningUptimeLabel}</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <IconGrid className="text-emerald-500 w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-slate-500">Mined blocks (24h)</span>
        </div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">
          {isConnected ? minedBlocksCount : '0'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {isConnected ? `+${minedBlocksCount * 2} CMU rewards` : '--'}
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <IconGlobe className="text-violet-500 w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-slate-500">Network hashrate</span>
        </div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{hashrateDisplay}</p>
        <p className="text-xs text-slate-400 mt-1">{isConnected ? 'Real-time via RPC' : '--'}</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <IconLink className="text-amber-500 w-3.5 h-3.5" />
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
