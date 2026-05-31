import { type JSX } from 'react'
import { type BlockData } from '@/hooks'
import { formatRelativeAge } from '@/utils'

interface ActivityFeedProps {
  isConnected: boolean
  recentBlocks: BlockData[]
  activeWalletAddress: string | null
  abbrAddress: string
}

/**
 * Activity feed panel listing mining-reward transactions credited to the active
 * wallet, derived from recent blocks the wallet mined.
 * @param props - Connection state, recent blocks, active address, and its label.
 * @returns The rendered activity feed panel.
 */
function ActivityFeed({
  isConnected,
  recentBlocks,
  activeWalletAddress,
  abbrAddress
}: ActivityFeedProps): JSX.Element {
  const selfMinedBlocks = recentBlocks.filter(
    (block) => block.miner.toLowerCase() === activeWalletAddress?.toLowerCase()
  )
  const hasActivity = isConnected && selfMinedBlocks.length > 0

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800">Your activity</h3>
        <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-0.5">
          Export
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
      <p className="text-[10px] text-slate-400 mb-4 font-mono">Transactions for {abbrAddress}</p>

      <div className="space-y-0">
        {hasActivity ? (
          selfMinedBlocks.slice(0, 10).map((block) => (
            <div
              key={block.hash}
              className="flex items-center justify-between py-3.5 border-t border-slate-100 first:border-t-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
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
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Mining reward
                    <span className="font-normal text-slate-400 ml-1.5 font-mono">
                      block #{block.number}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatRelativeAge(block.timestamp)} - confirmed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono text-emerald-600">
                  +2.00
                  <span className="text-[10px] font-medium text-slate-400 ml-1">CMU</span>
                </p>
                <p className="text-[10px] text-slate-400">fee 0 gwei</p>
              </div>
            </div>
          ))
        ) : (
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-sm font-medium text-slate-400">No activity yet</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Start mining to see rewards</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { ActivityFeed }
export type { ActivityFeedProps }
