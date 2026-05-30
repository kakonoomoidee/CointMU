import { useState, useEffect, type JSX } from 'react'
import {
  useNetworkStats,
  useRecentBlocks,
  useMiningStats,
  useMiningControls,
  useMiningActivity,
  useTimer
} from '@/hooks'
import { useMiningStore } from '@/store'
import { generateIdenticonGradient } from '@/services'
import { formatAge, isWithinLastDay } from '@/utils'
import { Card, Button, Badge, StatusPill, StatCard } from '@/components'
import { IconPlay, IconStop, IconSettings, IconCheck, IconCube, IconAlertCircle } from '@/assets/icons'

interface MinerProps {
  activeWalletAddress: string | null
  balance: string
}

const BLOCK_REWARD_CMU = '2.00'
const SELF_BLOCK_REWARD = '+10.00'
const DEFAULT_CONCURRENCY = 8
const SHARES_WINDOW_SIZE = 60

const INTENSITY_OPTIONS = ['Eco', 'Balanced', 'Turbo'] as const

const ACTIVITY_TAB_FOUND = 'Found'
const ACTIVITY_TAB_SHARES = 'Shares'
const ACTIVITY_TAB_LOG = 'Log'
const ACTIVITY_TABS = [ACTIVITY_TAB_FOUND, ACTIVITY_TAB_SHARES, ACTIVITY_TAB_LOG] as const

/**
 * Resolves a safe CPU core count from the browser environment, falling back to
 * a sensible default when the hardware concurrency hint is unavailable.
 * @returns The detected core count or the default concurrency.
 */
function getSafeConcurrency(): number {
  try {
    return (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || DEFAULT_CONCURRENCY
  } catch {
    return DEFAULT_CONCURRENCY
  }
}

/**
 * Presentational mining controller view. All telemetry, control, timer, and
 * activity state is sourced from dedicated hooks, and all UI is composed from
 * the shared atomic component and icon libraries. The view contains no IPC or
 * business-effect logic of its own.
 * @param props - The active wallet address and current wallet balance.
 * @returns The complete mining view with hero, KPI grid, worker config, and feed.
 */
function Miner({ activeWalletAddress, balance }: MinerProps): JSX.Element {
  const [maxCores] = useState<number>(getSafeConcurrency())
  const [activeTab, setActiveTab] = useState<string>(ACTIVITY_TAB_FOUND)

  const networkStats = useNetworkStats()
  const isConnected = networkStats.isConnected
  const recentBlocks = useRecentBlocks(networkStats.blockHeight, isConnected)

  const telemetry = useMiningStats()
  const { config, toggling, error, toggle } = useMiningControls()
  const { startTime, toggleMining, foundBlocks } = useMiningStore()

  const isMining = telemetry.isMining
  const elapsedTime = useTimer(startTime, isMining)
  const { logs, noncesTried } = useMiningActivity(
    recentBlocks,
    activeWalletAddress,
    isMining,
    telemetry.hashrateMhs
  )

  useEffect(() => {
    toggleMining(isMining)
  }, [isMining, toggleMining])

  const rewardAddress = config.poolAddress || activeWalletAddress || ''
  const hashrate = telemetry.hashrateMhs

  const parsedBalance = parseFloat(balance.replace(/,/g, ''))
  const blocksFoundToday = foundBlocks.filter((block) => isWithinLastDay(block.timestamp)).length
  const formattedRewards = isNaN(parsedBalance)
    ? '0.0'
    : parsedBalance.toLocaleString(undefined, {
        minimumFractionDigits: parsedBalance % 1 === 0 ? 1 : 2,
        maximumFractionDigits: 2
      })

  const nextBlock = (telemetry.blockNumber || networkStats.blockHeight || 0) + 1
  const difficultyLabel = telemetry.difficulty > 0 ? '0x' + telemetry.difficulty.toString(16) : 'Loading...'

  const sharesData = Array.from({ length: SHARES_WINDOW_SIZE }).map((_, i) => {
    const blockIndex = SHARES_WINDOW_SIZE - 1 - i
    if (blockIndex < recentBlocks.length) {
      return recentBlocks[blockIndex].miner.toLowerCase() === activeWalletAddress?.toLowerCase()
    }
    return null
  })

  const minedBlocks = foundBlocks
  const acceptedShares = sharesData.filter((share) => share === true).length
  const networkShares = sharesData.filter((share) => share === false).length

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
            Workspace
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">Mining</span>
        </div>

        <div className="flex items-center gap-3">
          {isMining ? (
            <StatusPill tone="success" label="Mining" pulse />
          ) : telemetry.powerStatus === 'Paused (Battery)' ? (
            <StatusPill tone="warning" label={telemetry.powerStatus} />
          ) : (
            <StatusPill tone="neutral" label="Stopped" showDot={false} />
          )}

          <Button variant="secondary" leftIcon={<IconSettings width={14} height={14} />}>
            Preferences
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
        {isMining ? (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-7 text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-600/20 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-emerald-500/10" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold tracking-tight font-mono">
                      {hashrate.toFixed(2)}
                    </span>
                    <span className="text-xl font-semibold text-white/70">MH/s</span>
                  </div>
                  <p className="text-sm text-white/60 mt-2">
                    Mining with {config.cpuThreads} threads
                  </p>
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
                    onClick={() => toggle(false)}
                    disabled={toggling}
                    leftIcon={<IconStop width={14} height={14} />}
                  >
                    {toggling ? 'Stopping...' : 'Stop mining'}
                  </Button>
                </div>
              </div>

              <div className="mt-4 mb-3">
                <p className="text-[11px] text-emerald-100/80 font-mono mb-2 tracking-wide font-medium">
                  Solving candidate #{nextBlock.toLocaleString()} - {noncesTried.toLocaleString()} nonces tried
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
        ) : telemetry.isGeneratingDag ? (
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
                      {telemetry.dagProgress}
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
                    style={{ width: `${telemetry.dagProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 p-7 text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-slate-700/20 blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                  Idle
                </span>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold tracking-tight font-mono text-white/80">0.00</span>
                    <span className="text-xl font-semibold text-white/40">MH/s</span>
                  </div>
                  <p className="text-sm text-white/50 mt-2">
                    {config.isMiningEnabled ? (
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
                    onClick={() => toggle(true)}
                    disabled={toggling || !config.isMiningEnabled}
                    title={!config.isMiningEnabled ? 'Mining is disabled in Settings' : ''}
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
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
            <IconAlertCircle className="text-red-500 flex-shrink-0" width={16} height={16} />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-5">
          <StatCard label="Session Time" value={elapsedTime} hint={isMining ? 'Active' : 'Idle'} valueClassName="font-mono" />
          <StatCard label="Blocks Found" value={blocksFoundToday} hint="past 24 hours" />
          <StatCard
            label="Total Earned"
            value={
              <>
                +{balance}
                <span className="text-sm font-medium text-slate-400 ml-1.5">CMU</span>
              </>
            }
            hint="across this wallet"
            valueClassName="text-emerald-600"
          />
          <StatCard
            label="Hashrate - 5 min"
            action={<Badge tone={isMining ? 'success' : 'neutral'}>{isMining ? 'Stable' : 'Idle'}</Badge>}
            value={isMining ? `${hashrate.toFixed(2)} MH/s` : '0.00 MH/s'}
            valueClassName="font-mono"
            hint={
              <span className="block mt-2 h-10">
                <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
                  {isMining ? (
                    <path
                      d="M0,30 L10,28 L20,25 L30,27 L40,22 L50,20 L60,24 L70,18 L80,22 L90,16 L100,20 L110,14 L120,18 L130,12 L140,16 L150,10 L160,14 L170,8 L180,12 L190,10 L200,8"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M0,35 L10,35 L20,34 L30,35 L40,35 L50,34 L60,35 L70,35 L80,34 L90,35 L100,35 L110,34 L120,35 L130,35 L140,34 L150,35 L160,35 L170,34 L180,35 L190,35 L200,35"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-[1fr_1.2fr] gap-5">
          <Card>
            <div className="mb-1">
              <h3 className="text-sm font-bold text-slate-800">Worker configuration</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Current internal node configuration</p>
            </div>

            <div className="divide-y divide-slate-100 mt-4 opacity-80 pointer-events-none">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Worker threads</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {config.cpuThreads} of {maxCores} cores
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: maxCores }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-6 rounded-sm cursor-default ${i < config.cpuThreads ? 'bg-emerald-400' : 'bg-slate-200'}`}
                      title={`${i + 1} Thread${i === 0 ? '' : 's'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Intensity</p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[140px]">
                    Higher = more heat, faster solves
                  </p>
                </div>
                <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                  {INTENSITY_OPTIONS.map((option) => (
                    <div
                      key={option}
                      className={`px-3.5 py-1.5 text-xs font-semibold cursor-default transition-colors ${
                        config.intensity === option ? 'bg-slate-300 text-slate-700' : 'bg-white text-slate-400'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Reward address</p>
                  <p className="text-xs text-slate-400 mt-0.5">Block rewards are credited here</p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full bg-gradient-to-br ${generateIdenticonGradient(rewardAddress)} flex-shrink-0`}
                  />
                  <span className="text-xs font-mono text-slate-500 font-medium tracking-tight">
                    {rewardAddress.substring(0, 10)}...{rewardAddress.substring(rewardAddress.length - 8)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Mining activity</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Blocks you found and what the network paid
                </p>
              </div>
              <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                {ACTIVITY_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === tab ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              {activeTab === ACTIVITY_TAB_FOUND && (
                <div className="h-[280px] overflow-y-auto pr-1">
                  {minedBlocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <IconCube className="text-slate-300 mb-3" width={32} height={32} />
                      <p className="text-sm font-medium text-slate-400">No blocks found yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start mining to find blocks</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {minedBlocks.map((block) => (
                        <div
                          key={block.hash}
                          className="flex items-center justify-between py-4 px-2 hover:bg-slate-50/50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                              <IconCheck width={16} height={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">
                                  #{block.number.toLocaleString()}
                                </span>
                                <span className="text-xs font-mono text-slate-400">
                                  {block.hash.substring(0, 6)}...{block.hash.substring(block.hash.length - 4)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{formatAge(block.timestamp)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-500 tracking-tight">{SELF_BLOCK_REWARD}</span>
                            <span className="text-xs font-medium text-emerald-500/70 ml-1">CMU</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === ACTIVITY_TAB_SHARES && (
                <div className="flex flex-col h-[280px]">
                  <p className="text-[11px] font-semibold text-slate-500 mb-3">
                    Accepted shares - last 14 minutes
                  </p>
                  <div className="flex-1 flex flex-wrap gap-1.5 content-start">
                    {sharesData.map((status, index) => (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-sm ${
                          status === true ? 'bg-green-500' : status === false ? 'bg-green-200' : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-medium text-slate-500">
                      <span className="font-bold text-slate-800">{acceptedShares}</span> shares accepted -{' '}
                      <span className="font-bold text-slate-800">{networkShares}</span> evaluated
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 mr-1">Less</span>
                      <div className="w-3 h-3 rounded-sm bg-slate-100" />
                      <div className="w-3 h-3 rounded-sm bg-green-200" />
                      <div className="w-3 h-3 rounded-sm bg-green-500" />
                      <span className="text-[10px] text-slate-400 ml-1">More</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === ACTIVITY_TAB_LOG && (
                <div className="h-[280px] bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-[11px] shadow-inner">
                  <div className="space-y-1.5">
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 hover:bg-slate-800/50 px-2 py-0.5 rounded transition-colors"
                        >
                          <span className="text-slate-500 w-16 flex-shrink-0">{log.timestamp}</span>
                          <span className={`${log.color} w-8 flex-shrink-0 font-bold`}>{log.level}</span>
                          <span className="text-slate-300 flex-1 whitespace-pre-wrap">{log.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-center py-8">Awaiting network activity...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export { Miner }
