import { type JSX, useEffect, useState } from 'react'

interface BlockItem {
  number: number
  hash: string
  miner: string
  timestamp: number
  txCount: number
}

interface ChainTimelineProps {
  blocks: BlockItem[]
  coinbase: string
  isOnline: boolean
}

function formatAge(timestamp: number, now: number): string {
  const diff = Math.floor(now / 1000) - timestamp
  if (diff < 0) return 'Just now'
  if (diff < 60) return `${diff}s ago`
  const m = Math.floor(diff / 60)
  const s = diff % 60
  if (m < 60) return `${m}m ${s}s ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

/**
 * A horizontal timeline component rendering recent blocks as cards.
 * Highlights blocks mined by the local node automatically.
 * @param {ChainTimelineProps} props - The network insights data.
 * @returns {JSX.Element} The rendered Chain Timeline row.
 */
export function ChainTimeline({ blocks, coinbase, isOnline }: ChainTimelineProps): JSX.Element {
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Chain timeline</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Latest 12 blocks — newest on the right</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isOnline ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
          <span className="text-[10px] font-bold">{isOnline ? 'Updating - 3s' : 'Offline'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 hide-scrollbar">
        {!isOnline ? (
          <div className="w-full py-8 flex flex-col items-center justify-center text-center">
            <svg className="text-red-300 mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <p className="text-sm font-medium text-slate-500">Node is offline</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Please start the node or enable RPC in Settings to view network activity.</p>
          </div>
        ) : blocks.length > 0 ? (
          // Reverse blocks so newest is on the right
          [...blocks].reverse().map((block) => {
            const isLocal = coinbase && block.miner.toLowerCase() === coinbase.toLowerCase()
            return (
              <div key={block.hash} className="flex flex-col items-center flex-shrink-0 min-w-[70px]">
                <div 
                  className={`relative w-full rounded-xl border flex flex-col items-center justify-center py-3 mb-3 shadow-sm transition-transform hover:-translate-y-1 ${
                    isLocal 
                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {isLocal && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                      <svg className="text-emerald-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  <span className={`text-[8px] font-bold tracking-widest uppercase mb-1 ${isLocal ? 'text-emerald-100' : 'text-slate-400'}`}>Block</span>
                  <span className="text-sm font-bold font-mono">#{block.number}</span>
                  <span className={`text-[9px] mt-1 ${isLocal ? 'text-emerald-100' : 'text-slate-500'}`}>{block.txCount} tx</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                  {formatAge(block.timestamp, now)}
                </span>
              </div>
            )
          })
        ) : (
          <div className="w-full py-8 flex flex-col items-center justify-center">
            <svg className="text-slate-300 mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
