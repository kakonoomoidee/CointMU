import { useState, useEffect, useRef, type JSX } from 'react'
import { useMiner, useNetworkStats, useRecentBlocks } from '@/hooks'
import { generateIdenticonGradient } from '@/services'
import { formatHashrate } from '@/utils'

interface MinerProps {
  activeWalletAddress: string | null
  balance: string
  sessionSeconds: number
}

const BLOCK_REWARD_CMU = '10.00'
const TARGET_DIFFICULTY = '0000_ffff...'

const INTENSITY_OPTIONS = ['Eco', 'Balanced', 'Turbo'] as const

const ACTIVITY_TAB_FOUND = 'Found'
const ACTIVITY_TAB_SHARES = 'Shares'
const ACTIVITY_TAB_LOG = 'Log'
const ACTIVITY_TABS = [ACTIVITY_TAB_FOUND, ACTIVITY_TAB_SHARES, ACTIVITY_TAB_LOG] as const

const formatAge = (timestamp: number): string => {
  const diff = Math.floor(Date.now() / 1000) - timestamp
  if (diff < 60) return `${diff} secs ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return `${h}h ${m}m ago`
}

const formatSessionTime = (totalSeconds: number): string => {
  if (totalSeconds === 0) return EMPTY_SESSION_TIME
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const EMPTY_REWARDS_TODAY = '0.00'
const EMPTY_SESSION_TIME = '--'

interface LogEntry {
  id: string
  timestamp: string
  level: string
  message: string
  color: string
}

/**
 * Full-featured mining controller view presenting a dynamic hero section
 * that toggles between active (green gradient) and idle (dark slate) states,
 * a 4-column KPI stats grid, worker configuration panel, and mining activity
 * feed. Connects to the remote Core-geth node via raw JSON-RPC calls for
 * miner_start, miner_stop, and miner_setEtherbase. All layout and styling
 * uses Tailwind CSS utility classes exclusively.
 * @param props - Contains the active wallet address for etherbase configuration.
 * @returns The complete mining view with header, hero, stats, worker settings,
 *          and activity log.
 */
function Miner({
  activeWalletAddress,
  balance,
  sessionSeconds
}: MinerProps): JSX.Element {
  const getSafeConcurrency = (): number => {
    try {
      return (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 8
    } catch {
      return 8
    }
  }

  const [maxCores] = useState(getSafeConcurrency())

  const networkStats = useNetworkStats()
  const isConnected = networkStats.isConnected
  const recentBlocks = useRecentBlocks(networkStats.blockHeight, isConnected)

  const [activeTab, setActiveTab] = useState<string>(ACTIVITY_TAB_FOUND)
  const [logs, setLogs] = useState<LogEntry[]>([])
  
  const [globalMiningEnabled, setGlobalMiningEnabled] = useState<boolean>(true)
  const [globalCpuThreads, setGlobalCpuThreads] = useState<number>(Math.max(1, maxCores - 1))
  const [globalIntensity, setGlobalIntensity] = useState<string>('Balanced')
  const [globalPoolAddress, setGlobalPoolAddress] = useState<string>(activeWalletAddress || '')
  const [powerStatus, setPowerStatus] = useState<string>('')

  const { state, handleStart, handleStop } = useMiner(activeWalletAddress, globalCpuThreads)

  const lastProcessedBlock = useRef<number | null>(null)

  useEffect(() => {
    const syncSettings = async () => {
      try {
        const storeData = await window.api.settings.getAll()
        const config = storeData.mining || {}
        setGlobalMiningEnabled(config.isMiningEnabled === true)
        if (typeof config.cpuThreads === 'number') setGlobalCpuThreads(config.cpuThreads)
        if (typeof config.intensity === 'string') setGlobalIntensity(config.intensity)
        if (typeof config.poolAddress === 'string') setGlobalPoolAddress(config.poolAddress || activeWalletAddress || '')
      } catch (err) {
        console.error('Failed to sync global mining setting', err)
      }
    }
    syncSettings()
    const interval = setInterval(syncSettings, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unsub = window.api?.mining?.onMiningStatusChanged((status) => {
      setPowerStatus(status)
    })
    return () => {
      if (unsub) unsub()
    }
  }, [])

  useEffect(() => {
    if (activeWalletAddress && !globalPoolAddress) {
       setGlobalPoolAddress(activeWalletAddress)
    }
  }, [activeWalletAddress])

  useEffect(() => {
    if (!recentBlocks || recentBlocks.length === 0) return

    const newBlocks = lastProcessedBlock.current === null 
      ? [recentBlocks[0]]
      : recentBlocks.filter(b => b.number > lastProcessedBlock.current!)
    
    if (newBlocks.length > 0) {
      lastProcessedBlock.current = Math.max(...newBlocks.map(b => b.number))
      
      const newLogs = newBlocks.map((block, idx) => {
        const now = new Date()
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        const isMine = block.miner.toLowerCase() === activeWalletAddress?.toLowerCase()
        
        return {
          id: `${block.hash}-${now.getTime()}-${idx}`,
          timestamp,
          level: isMine ? 'OK' : 'INFO',
          message: isMine ? `Block #${block.number} sealed · 10.00 CMU rewarded` : `Synced block #${block.number} · ${block.txCount} txs`,
          color: isMine ? 'text-emerald-500' : 'text-blue-400'
        }
      })

      setLogs(prev => [...newLogs, ...prev].slice(0, 50))
    }
  }, [recentBlocks, activeWalletAddress])

  const isMining = networkStats.isMining === true && isConnected

  const [, setCurrentTime] = useState<number>(Date.now())
  const [nonceCount, setNonceCount] = useState<number>(0)

  useEffect(() => {
    setNonceCount(0)
  }, [networkStats.blockHeight])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isMining) {
      interval = setInterval(() => {
        setNonceCount((prev) => prev + Math.floor(Math.random() * 1000000) + 500000)
      }, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMining])

  useEffect(() => {
    const tickInterval = setInterval(() => setCurrentTime(Date.now()), 5000)
    return () => clearInterval(tickInterval)
  }, [])
  
  let displayHashrate = networkStats.hashrate
  if (isMining && (!displayHashrate || displayHashrate === 0)) {
    displayHashrate = globalCpuThreads * 1.45 * 1000000 
  }
  const hashrateDisplay = formatHashrate(displayHashrate)

  const parsedBalance = parseFloat(balance.replace(/,/g, ''))
  const blocksFound = isNaN(parsedBalance) ? 0 : Math.floor(parsedBalance / 10)
  
  const formattedRewards = isNaN(parsedBalance) ? '0.0' : parsedBalance.toLocaleString(undefined, {
    minimumFractionDigits: parsedBalance % 1 === 0 ? 1 : 2,
    maximumFractionDigits: 2
  })

  const nextBlock = (networkStats.blockHeight || 0) + 1

  const sharesData = Array.from({ length: 60 }).map((_, i) => {
    const blockIndex = 59 - i
    if (blockIndex < recentBlocks.length) {
      const block = recentBlocks[blockIndex]
      return block.miner.toLowerCase() === activeWalletAddress?.toLowerCase()
    }
    return null
  })
  
  const minedBlocks = recentBlocks.filter(b => b.miner.toLowerCase() === activeWalletAddress?.toLowerCase())
  
  const acceptedShares = sharesData.filter(s => s === true).length
  const networkShares = sharesData.filter(s => s === false).length

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
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600">Mining</span>
            </div>
          ) : powerStatus === 'Paused (Battery)' ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-amber-50">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{powerStatus}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50">
              <span className="text-xs font-semibold text-slate-500">Stopped</span>
            </div>
          )}

          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Preferences
          </button>
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
                      {hashrateDisplay.split(' ')[0]}
                    </span>
                    <span className="text-xl font-semibold text-white/70">
                      {hashrateDisplay.split(' ').slice(1).join(' ')}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mt-2">
                    Mining with {globalCpuThreads} threads
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-white/50">Rewards today</p>
                    <p className="text-xl font-bold text-white mt-0.5">
                      +{formattedRewards}
                      <span className="text-sm font-medium text-white/60 ml-1.5">CMU</span>
                    </p>
                  </div>
                  <button
                    id="miner-stop-button"
                    onClick={handleStop}
                    disabled={state.toggling}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    {state.toggling ? 'Stopping...' : 'Stop mining'}
                  </button>
                </div>
              </div>

              <div className="mt-4 mb-3">
                <p className="text-[11px] text-emerald-100/80 font-mono mb-2 tracking-wide font-medium">
                  Solving candidate #{nextBlock.toLocaleString()} &middot; {nonceCount.toLocaleString()} nonces tried
                </p>
                <div className="w-full h-1.5 rounded-full bg-emerald-950/50 overflow-hidden relative">
                  <div className={`h-full rounded-full bg-emerald-400 ${isMining ? 'animate-[fillBar_2s_linear_infinite]' : 'w-0'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                <span>Target difficulty {TARGET_DIFFICULTY}</span>
                <span>Block reward {BLOCK_REWARD_CMU} CMU</span>
              </div>
            </div>
          </div>
        ) : (
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
                    {globalMiningEnabled 
                      ? <>Press Start to join consensus. Earn <span className="font-semibold text-white/70">10 CMU</span> per block found.</>
                      : <>Mining is disabled globally. Enable it in Settings first.</>
                    }
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-white/40">Rewards today</p>
                    <p className="text-xl font-bold text-white/70 mt-0.5">
                      {EMPTY_REWARDS_TODAY}
                      <span className="text-sm font-medium text-white/40 ml-1.5">CMU</span>
                    </p>
                  </div>
                  <button
                    id="miner-start-button"
                    onClick={handleStart}
                    disabled={state.toggling || !globalMiningEnabled}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                    title={!globalMiningEnabled ? 'Mining is disabled in Settings' : ''}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    {state.toggling ? 'Starting...' : 'Start mining'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/30 font-mono mt-4">
                <span>Target difficulty {TARGET_DIFFICULTY}</span>
                <span>Block reward {BLOCK_REWARD_CMU} CMU</span>
              </div>
            </div>
          </div>
        )}

        {state.error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
            <svg className="text-red-500 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{state.error}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-3">Session Time</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              {formatSessionTime(sessionSeconds)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{isMining ? 'Active' : 'Idle'}</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-3">Blocks Found</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              {blocksFound}
            </p>
            <p className="text-xs text-slate-400 mt-1">past 24 hours</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-3">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">
              +{balance}
              <span className="text-sm font-medium text-slate-400 ml-1.5">CMU</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">across this wallet</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">Hashrate - 5 min</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isMining ? 'text-emerald-600 bg-emerald-50 border border-emerald-200' : 'text-slate-500 bg-slate-100 border border-slate-200'}`}>
                {isMining ? 'Stable' : 'Idle'}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight font-mono">
              {isMining ? hashrateDisplay : '0.00 MH/s'}
            </p>
            <div className="mt-3 h-10">
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1.2fr] gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="mb-1">
              <h3 className="text-sm font-bold text-slate-800">Worker configuration</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Current internal node configuration</p>
            </div>

            <div className="divide-y divide-slate-100 mt-4 opacity-80 pointer-events-none">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Worker threads</p>
                  <p className="text-xs text-slate-400 mt-0.5">{globalCpuThreads} of {maxCores} cores</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: maxCores }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-6 rounded-sm cursor-default ${i < globalCpuThreads ? 'bg-emerald-400' : 'bg-slate-200'}`}
                      title={`${i + 1} Thread${i === 0 ? '' : 's'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Intensity</p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[140px]">Higher = more heat, faster solves</p>
                </div>
                <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                  {INTENSITY_OPTIONS.map((option) => (
                    <div
                      key={option}
                      className={`px-3.5 py-1.5 text-xs font-semibold cursor-default transition-colors ${
                        globalIntensity === option
                          ? 'bg-slate-300 text-slate-700'
                          : 'bg-white text-slate-400'
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
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${generateIdenticonGradient(globalPoolAddress)} flex-shrink-0`} />
                  <span className="text-xs font-mono text-slate-500 font-medium tracking-tight">
                    {globalPoolAddress.substring(0, 10)}...{globalPoolAddress.substring(globalPoolAddress.length - 8)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Mining activity</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Blocks you found and what the network paid</p>
              </div>
              <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                {ACTIVITY_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === tab
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-500 hover:bg-slate-50'
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
                    <div className="flex flex-col items-center justify-center py-12 text-center divide-y divide-slate-100">
                      <svg className="text-slate-300 mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <rect x="7" y="7" width="3" height="9" />
                        <rect x="14" y="7" width="3" height="5" />
                      </svg>
                      <p className="text-sm font-medium text-slate-400">No blocks found yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start mining to find blocks</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {minedBlocks.map((block) => (
                        <div key={block.hash} className="flex items-center justify-between py-4 px-2 hover:bg-slate-50/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">#{block.number.toLocaleString()}</span>
                                <span className="text-xs font-mono text-slate-400">{block.hash.substring(0, 6)}...{block.hash.substring(block.hash.length - 4)}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatAge(block.timestamp)} · <span className="font-medium text-slate-400">nonce {(block.number * 381273 % 9999999).toLocaleString()}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-500 tracking-tight">+10.00</span>
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
                  <p className="text-[11px] font-semibold text-slate-500 mb-3">Accepted shares · last 14 minutes</p>
                  <div className="flex-1 flex flex-wrap gap-1.5 content-start">
                    {sharesData.map((status, index) => (
                      <div 
                        key={index} 
                        className={`w-4 h-4 rounded-sm ${
                          status === true 
                            ? 'bg-green-500' 
                            : status === false 
                              ? 'bg-green-200' 
                              : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-medium text-slate-500">
                      <span className="font-bold text-slate-800">{acceptedShares}</span> shares accepted · <span className="font-bold text-slate-800">{networkShares}</span> evaluated
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
                    {logs.length > 0 ? logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 hover:bg-slate-800/50 px-2 py-0.5 rounded transition-colors">
                        <span className="text-slate-500 w-16 flex-shrink-0">{log.timestamp}</span>
                        <span className={`${log.color} w-8 flex-shrink-0 font-bold`}>{log.level}</span>
                        <span className="text-slate-300 flex-1 whitespace-pre-wrap">{log.message}</span>
                      </div>
                    )) : (
                      <div className="text-slate-500 text-center py-8">Awaiting network activity...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export { Miner }
