import { type JSX } from 'react'
import { Button } from '@/components'
import { IconPlay, IconStop } from '@/assets/icons'

const BLOCK_REWARD_CMU = '2.00'

interface MiningHeroCardProps {
  isMining: boolean
  isGeneratingDag: boolean
  dagProgress: number
  isMiningEnabled: boolean
  cpuThreads: number
  hashrateLabel: string
  formattedRewards: string
  difficultyLabel: string
  nextBlock: number
  noncesTried: number
  toggling: boolean
  onToggle: (enabled: boolean) => void
}

/**
 * Hero card for the mining view that renders one of three mutually exclusive
 * states: actively mining, generating the verification DAG, or idle. Each state
 * presents the relevant hashrate, rewards, and primary action.
 * @param props - Telemetry, config, derived labels, and the toggle handler.
 * @returns The rendered hero card for the current mining state.
 */
function MiningHeroCard({
  isMining,
  isGeneratingDag,
  dagProgress,
  isMiningEnabled,
  cpuThreads,
  hashrateLabel,
  formattedRewards,
  difficultyLabel,
  nextBlock,
  noncesTried,
  toggling,
  onToggle
}: MiningHeroCardProps): JSX.Element {
  if (isMining) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-7 text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-600/20 blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-emerald-500/10" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight font-mono">{hashrateLabel}</span>
                <span className="text-xl font-semibold text-white/70">MH/s</span>
              </div>
              <p className="text-sm text-white/60 mt-2">Mining with {cpuThreads} threads</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-white/50">
                  Rewards today
                </p>
                <p className="text-xl font-bold text-white mt-0.5">
                  +{formattedRewards}
                  <span className="text-sm font-medium text-white/60 ml-1.5">CMU</span>
                </p>
              </div>
              <Button
                id="miner-stop-button"
                variant="danger"
                size="lg"
                onClick={() => onToggle(false)}
                disabled={toggling}
                leftIcon={<IconStop width={14} height={14} />}
              >
                {toggling ? 'Stopping...' : 'Stop mining'}
              </Button>
            </div>
          </div>

          <div className="mt-4 mb-3">
            <p className="text-[11px] text-emerald-100/80 font-mono mb-2 tracking-wide font-medium">
              Solving candidate #{nextBlock.toLocaleString()} - {noncesTried.toLocaleString()} nonces
              tried
            </p>
            <div className="w-full h-1.5 rounded-full bg-emerald-950/50 overflow-hidden relative">
              <div className="h-full rounded-full bg-emerald-400 animate-[fillBar_2s_linear_infinite]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/40 font-mono">
            <span>Target difficulty {difficultyLabel}</span>
            <span>Block reward {BLOCK_REWARD_CMU} CMU</span>
          </div>
        </div>
      </div>
    )
  }

  if (isGeneratingDag) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 p-7 text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-slate-700/20 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
              Initializing
            </span>
          </div>

          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight font-mono text-white/90">
                  {dagProgress}
                </span>
                <span className="text-xl font-semibold text-white/50">%</span>
              </div>
              <p className="text-sm text-white/50 mt-2">
                Generating Directed Acyclic Graph (DAG) for verification...
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-white/40">
                  Rewards today
                </p>
                <p className="text-xl font-bold text-white/70 mt-0.5">
                  0.00
                  <span className="text-sm font-medium text-white/40 ml-1.5">CMU</span>
                </p>
              </div>
              <Button variant="success" size="lg" disabled>
                Generating DAG...
              </Button>
            </div>
          </div>

          <div className="mt-4 mb-3">
            <div className="w-full h-1.5 rounded-full bg-slate-900/50 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300 ease-out"
                style={{ width: `${dagProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 p-7 text-white relative overflow-hidden">
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-slate-700/20 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Idle</span>
        </div>

        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight font-mono text-white/80">0.00</span>
              <span className="text-xl font-semibold text-white/40">MH/s</span>
            </div>
            <p className="text-sm text-white/50 mt-2">
              {isMiningEnabled ? (
                <>
                  Press Start to join consensus. Earn{' '}
                  <span className="font-semibold text-white/70">2 CMU</span> per block found.
                </>
              ) : (
                <>Mining is disabled globally. Enable it in Settings first.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-white/40">
                Rewards today
              </p>
              <p className="text-xl font-bold text-white/70 mt-0.5">
                0.00
                <span className="text-sm font-medium text-white/40 ml-1.5">CMU</span>
              </p>
            </div>
            <Button
              id="miner-start-button"
              variant="success"
              size="lg"
              onClick={() => onToggle(true)}
              disabled={toggling || !isMiningEnabled}
              title={!isMiningEnabled ? 'Mining is disabled in Settings' : ''}
              leftIcon={<IconPlay width={14} height={14} />}
            >
              {toggling ? 'Starting...' : 'Start mining'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/30 font-mono mt-4">
          <span>Target difficulty {difficultyLabel}</span>
          <span>Block reward {BLOCK_REWARD_CMU} CMU</span>
        </div>
      </div>
    </div>
  )
}

export { MiningHeroCard }
export type { MiningHeroCardProps }
