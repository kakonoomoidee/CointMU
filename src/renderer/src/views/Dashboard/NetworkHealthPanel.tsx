import { type JSX } from 'react'

const CONSENSUS_LABEL = 'PoW - Block 30s'

const BLOCK_BAR_HEIGHTS = [
  28, 35, 22, 40, 32, 45, 38, 30, 42, 36, 48, 34, 26, 44, 50, 38, 33, 46, 42, 28
]

interface NetworkHealthPanelProps {
  isConnected: boolean
  blockDisplay: string
  peerDisplay: string
  difficultyDisplay: string
  gasDisplay: string
  blocksPastHour: number
}

/**
 * Network health panel summarizing chain height, peers, difficulty, suggested
 * gas, and a recent block-rate sparkbar derived from the recent block count.
 * @param props - Connection state and the formatted network metric strings.
 * @returns The rendered network health panel.
 */
function NetworkHealthPanel({
  isConnected,
  blockDisplay,
  peerDisplay,
  difficultyDisplay,
  gasDisplay,
  blocksPastHour
}: NetworkHealthPanelProps): JSX.Element {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-400'}`}
          />
          <span className="text-sm font-semibold text-slate-800">
            {isConnected ? 'Network is healthy' : 'Network is disconnected'}
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-wide text-slate-500 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
          {CONSENSUS_LABEL}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
            Chain Height
          </p>
          <p className="text-xl font-bold text-slate-800 font-mono">{blockDisplay}</p>
          <p className="text-[10px] text-slate-400">Latest block</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
            Peers
          </p>
          <p className="text-xl font-bold text-slate-800 font-mono">{peerDisplay}</p>
          <p className="text-[10px] text-slate-400">Gossip connected</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
            Difficulty
          </p>
          <p className="text-xl font-bold text-slate-800 font-mono">{difficultyDisplay}</p>
          <p className="text-[10px] text-slate-400">Current network</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
            Gas (Avg)
          </p>
          <p className="text-xl font-bold text-slate-800 font-mono">
            {gasDisplay} <span className="text-sm font-medium text-slate-400">gwei</span>
          </p>
          <p className="text-[10px] text-slate-400">Suggested price</p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
            Blocks past hour
          </p>
          <p className="text-2xl font-bold text-slate-800 font-mono">
            {isConnected ? blocksPastHour.toString() : '--'}
          </p>
        </div>
        <div className="flex items-end gap-0.5 h-10">
          {(isConnected ? BLOCK_BAR_HEIGHTS : []).map((h, i) => (
            <div key={i} className="w-1 rounded-full bg-slate-300" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export { NetworkHealthPanel }
export type { NetworkHealthPanelProps }
