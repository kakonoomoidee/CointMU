import { useRpcPort, useNetworkStatus, useNetworkStats } from '@/hooks'
import { formatBlockNumber, formatHashrate, formatDifficulty } from '@/utils'
import { type JSX } from 'react'

const WALLET_BALANCE_CMU = '1,284.67'
const WALLET_BALANCE_USD = '$539.66'
const MINED_BLOCKS_24H = '7'
const MINED_BLOCKS_REWARD = '+70 CMU rewards'
const NETWORK_HASHRATE = '48.3 GH/s'
const NETWORK_HASHRATE_TREND = '2.1% past hour'
const SMART_CONTRACTS_COUNT = '124'
const SMART_CONTRACTS_DEPLOYED = '3 deployed by you'
const CONSENSUS_LABEL = 'PoW - Block 30s'
const BLOCKS_PAST_HOUR = '119'

const LATEST_BLOCKS = [
  {
    number: '#28,481',
    reward: '+10 CMU mined',
    txHash: '0x9a3f...11c2',
    txCount: '0 txs',
    age: '8s ago',
    miner: '0xC0a7...90a1'
  },
  {
    number: '#28,480',
    reward: null,
    txHash: '0xa1c2...f9e3',
    txCount: '2 txs',
    age: '42s ago',
    miner: '0x3b7f...a201'
  }
]

const ACTIVITY_LOG = [
  {
    type: 'reward' as const,
    label: 'Mining reward',
    detail: 'block #28481',
    time: '8s ago - 1 confirmations',
    amount: '+10.00',
    unit: 'CMU',
    fee: 'fee 0 gwei',
    positive: true
  },
  {
    type: 'sent' as const,
    label: 'Sent',
    detail: 'to 0x8f1a...5f4a',
    time: '',
    amount: '-24.50',
    unit: 'CMU',
    fee: '',
    positive: false
  }
]

interface DashboardProps {
  activeWalletAddress: string | null
}

/**
 * Primary dashboard view presenting the wallet overview, network health,
 * KPI metrics, latest blocks, and transaction activity in a light-mode
 * layout matching the reference design specification.
 * @returns The complete dashboard layout with header, wallet card, network panel,
 *          KPI grid, latest blocks list, and activity feed.
 */
function Dashboard({ activeWalletAddress }: DashboardProps): JSX.Element {
  const { port } = useRpcPort()
  const networkStatus = useNetworkStatus(port)
  const networkStats = useNetworkStats(port)

  const isConnected = networkStats.isConnected

  const syncLabel = isConnected
    ? (networkStatus.syncing === false ? 'Synced' : 'Syncing')
    : 'Offline'

  const syncDotColor = isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
  const syncBorderColor = isConnected ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
  const syncTextColor = isConnected ? 'text-emerald-600' : 'text-slate-500'

  const miningLabel = isConnected && networkStats.isMining
    ? formatHashrate(networkStats.hashrate)
    : '0 H/s'
  const miningUptimeLabel = isConnected && networkStats.isMining
    ? 'Actively mining'
    : 'Miner idle'

  const difficultyDisplay = isConnected ? formatDifficulty(networkStats.difficulty) : '--'
  const gasDisplay = isConnected && networkStats.gasPriceGwei !== null ? networkStats.gasPriceGwei : '--'
  const blockDisplay = isConnected ? formatBlockNumber(networkStats.blockHeight) : '--'
  const peerDisplay = isConnected && networkStats.peerCount !== null ? String(networkStats.peerCount) : '--'

  const abbrAddress = activeWalletAddress 
    ? `${activeWalletAddress.substring(0, 6)}...${activeWalletAddress.substring(activeWalletAddress.length - 4)}` 
    : '--'

  if (networkStats.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50/80 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Connecting to local node...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
            Workspace
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">
            Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${syncBorderColor}`}>
            <span className={`w-2 h-2 rounded-full ${syncDotColor}`} />
            <span className={`text-xs font-semibold ${syncTextColor}`}>
              {syncLabel}
            </span>
          </div>

          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13" />
              <line x1="12" y1="6" x2="12" y2="18" />
            </svg>
            Receive
          </button>

          <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 11 12 6 7 11" />
              <line x1="12" y1="6" x2="12" y2="18" />
            </svg>
            Send
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
        <div className="grid grid-cols-[1.35fr_1fr] gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-7 text-white relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/5 blur-sm" />
            <div className="absolute -right-4 -bottom-8 w-40 h-40 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M22 10H2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">Main wallet</p>
                    <p className="text-xs text-white/60 font-mono" title={activeWalletAddress || undefined}>
                      {abbrAddress}
                    </p>
                  </div>
                </div>

                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white/90 hover:bg-white/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-4xl font-bold tracking-tight">
                    {isConnected ? WALLET_BALANCE_CMU : '0.00'}
                  </span>
                  <span className="text-lg font-semibold text-white/70">CMU</span>
                </div>
                <p className="text-sm text-white/50 mt-1">
                  ~ {isConnected ? WALLET_BALANCE_USD : '$0.00'} - estimated
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 11 12 6 7 11" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                  </svg>
                  Send
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="7 13 12 18 17 13" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                  </svg>
                  Receive
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Stake
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Mining live
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-400'}`} />
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
                <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">Chain Height</p>
                <p className="text-xl font-bold text-slate-800 font-mono">
                  {blockDisplay}
                </p>
                <p className="text-[10px] text-slate-400">Latest block</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">Peers</p>
                <p className="text-xl font-bold text-slate-800 font-mono">
                  {peerDisplay}
                </p>
                <p className="text-[10px] text-slate-400">Gossip connected</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">Difficulty</p>
                <p className="text-xl font-bold text-slate-800 font-mono">{difficultyDisplay}</p>
                <p className="text-[10px] text-slate-400">Current network</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1">Gas (Avg)</p>
                <p className="text-xl font-bold text-slate-800 font-mono">
                  {gasDisplay} <span className="text-sm font-medium text-slate-400">gwei</span>
                </p>
                <p className="text-[10px] text-slate-400">Suggested price</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">Blocks past hour</p>
                <p className="text-2xl font-bold text-slate-800 font-mono">{BLOCKS_PAST_HOUR}</p>
              </div>
              <div className="flex items-end gap-0.5 h-10">
                {(isConnected ? [28, 35, 22, 40, 32, 45, 38, 30, 42, 36, 48, 34, 26, 44, 50, 38, 33, 46, 42, 28] : []).map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-slate-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-500">Your mining</span>
              </div>
              <button className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-0.5">
                Open
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{miningLabel}</p>
            <p className="text-xs text-slate-400 mt-1">{miningUptimeLabel}</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="text-emerald-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-500">Mined blocks (24h)</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              {isConnected ? MINED_BLOCKS_24H : '0'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isConnected ? MINED_BLOCKS_REWARD : '--'}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg className="text-violet-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-500">Network hashrate</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              {isConnected ? NETWORK_HASHRATE : '--'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isConnected ? NETWORK_HASHRATE_TREND : '--'}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="text-amber-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-500">Smart contracts</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              {isConnected ? SMART_CONTRACTS_COUNT : '0'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isConnected ? SMART_CONTRACTS_DEPLOYED : '--'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 min-h-0">
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800">Latest blocks</h3>
              <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-0.5">
                View all
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4">Mined across the network</p>

            <div className="space-y-0">
              {(isConnected ? LATEST_BLOCKS : []).map((block, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-t border-slate-100 first:border-t-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 font-mono">{block.number}</span>
                        {block.reward && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {block.reward}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {block.txHash} - {block.txCount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{block.age}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{block.miner}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800">Your activity</h3>
              <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-0.5">
                Export
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 font-mono">Transactions for 0xC0a7...90a1</p>

            <div className="space-y-0">
              {(isConnected ? ACTIVITY_LOG : []).map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-t border-slate-100 first:border-t-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.positive ? 'bg-blue-50' : 'bg-amber-50'}`}>
                      {tx.positive ? (
                        <svg className="text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                      ) : (
                        <svg className="text-amber-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="17 11 12 6 7 11" />
                          <line x1="12" y1="6" x2="12" y2="18" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {tx.label}
                        <span className="font-normal text-slate-400 ml-1.5">{tx.detail}</span>
                      </p>
                      {tx.time && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{tx.time}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${tx.positive ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.amount}
                      <span className="text-[10px] font-medium text-slate-400 ml-1">{tx.unit}</span>
                    </p>
                    {tx.fee && (
                      <p className="text-[10px] text-slate-400">{tx.fee}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export { Dashboard }
