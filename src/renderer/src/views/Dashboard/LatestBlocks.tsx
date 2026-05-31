import { type JSX } from 'react'
import { type BlockData } from '@/hooks'
import { formatRelativeAge } from '@/utils'

interface LatestBlocksProps {
  isConnected: boolean
  recentBlocks: BlockData[]
  activeWalletAddress: string | null
}

/**
 * Latest blocks panel listing the most recent blocks mined across the network,
 * flagging blocks credited to the active wallet.
 * @param props - Connection state, the recent blocks, and the active address.
 * @returns The rendered latest blocks panel.
 */
function LatestBlocks({
  isConnected,
  recentBlocks,
  activeWalletAddress
}: LatestBlocksProps): JSX.Element {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800">Latest blocks</h3>
        <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-0.5">
          View all
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
      <p className="text-[10px] text-slate-400 mb-4">Mined across the network</p>

      <div className="space-y-0">
        {(isConnected ? recentBlocks : []).slice(0, 10).map((block) => (
          <div
            key={block.hash}
            className="flex items-center justify-between py-3.5 border-t border-slate-100 first:border-t-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
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
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    #{block.number}
                  </span>
                  {block.miner.toLowerCase() === activeWalletAddress?.toLowerCase() && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +2 CMU mined
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {block.hash.substring(0, 10)}...{block.hash.substring(block.hash.length - 8)} -{' '}
                  {block.txCount} txs
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{formatRelativeAge(block.timestamp)}</p>
              <p className="text-[10px] text-slate-400 font-mono">{block.miner.substring(0, 8)}...</p>
            </div>
          </div>
        ))}

        {isConnected && recentBlocks.length === 0 && (
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
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-sm font-medium text-slate-400">Awaiting network blocks</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { LatestBlocks }
export type { LatestBlocksProps }
