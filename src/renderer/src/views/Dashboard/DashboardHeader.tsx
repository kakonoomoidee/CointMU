import { type JSX } from 'react'
import { IconArrowDown, IconArrowUp } from '@/assets/icons'

interface DashboardHeaderProps {
  isConnected: boolean
  onReceive: () => void
  onSend: () => void
}

/**
 * Dashboard header presenting the workspace breadcrumb, the node sync status
 * pill, and the primary receive and send actions.
 * @param props - Connection state and the receive and send action handlers.
 * @returns The rendered dashboard header.
 */
function DashboardHeader({ isConnected, onReceive, onSend }: DashboardHeaderProps): JSX.Element {
  const syncLabel = isConnected ? 'Synced' : 'Offline'
  const syncDotColor = isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
  const syncBorderColor = isConnected
    ? 'border-emerald-200 bg-emerald-50'
    : 'border-slate-200 bg-slate-50'
  const syncTextColor = isConnected ? 'text-emerald-600' : 'text-slate-500'

  return (
    <header className="flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
          Workspace
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${syncBorderColor}`}>
          <span className={`w-2 h-2 rounded-full ${syncDotColor}`} />
          <span className={`text-xs font-semibold ${syncTextColor}`}>{syncLabel}</span>
        </div>

        <button
          onClick={onReceive}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <IconArrowDown width={14} height={14} />
          Receive
        </button>

        <button
          onClick={onSend}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <IconArrowUp width={14} height={14} strokeWidth={2.5} />
          Send
        </button>
      </div>
    </header>
  )
}

export { DashboardHeader }
export type { DashboardHeaderProps }
