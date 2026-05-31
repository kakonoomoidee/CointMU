import { type JSX } from 'react'

interface ExplorerHeaderProps {
  isConnected: boolean
  networkHeight: string
}

/**
 * Explorer header showing the network breadcrumb, the current block height or a
 * disconnected indicator, and the saved searches action.
 * @param props - Connection state and the formatted network height label.
 * @returns The rendered explorer header.
 */
function ExplorerHeader({ isConnected, networkHeight }: ExplorerHeaderProps): JSX.Element {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white/50 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
          Network
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">Explorer</span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
        >
          {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          <span className="text-[10px] font-bold tracking-wide">
            {isConnected ? `Block # ${networkHeight}` : 'Disconnected'}
          </span>
        </div>

        <button className="px-4 py-1.5 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          Saved searches
        </button>
      </div>
    </header>
  )
}

export { ExplorerHeader }
export type { ExplorerHeaderProps }
