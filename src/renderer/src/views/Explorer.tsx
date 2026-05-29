import { useState, type JSX } from 'react'
import { useNetworkStats } from '@/hooks'
import { formatBlockNumber, formatDifficulty } from '@/utils'

type TabState = 'blocks' | 'transactions' | 'accounts'

const TIMELINE_BLOCKS: never[] = []
const LATEST_BLOCKS: never[] = []
const TRANSACTIONS: never[] = []
const TOP_ACCOUNTS: never[] = []
const MINER_DISTRIBUTION: never[] = []

const EMPTY_STAT_LABEL = '--'
const EMPTY_COUNT_LABEL = '0'

/**
 * Explorer view featuring a global search, network statistics sourced from
 * the remote Core-geth JSON-RPC node, and placeholder tabbed data tables
 * for blocks, transactions, and accounts. Chain Height is populated from
 * the real eth_blockNumber response. All other statistical values display
 * placeholder labels until an indexer backend is available. Uses Tailwind
 * CSS for all styling.
 * @returns The explorer interface with real block height and empty data tables.
 */
function Explorer(): JSX.Element {
  const networkStats = useNetworkStats()
  const isConnected = networkStats.isConnected

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabState>('blocks')

  const networkHeight = isConnected ? formatBlockNumber(networkStats.blockHeight) : EMPTY_STAT_LABEL
  const networkDifficulty = isConnected ? formatDifficulty(networkStats.difficulty) : EMPTY_STAT_LABEL

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <header className="flex items-center justify-between px-8 py-4 bg-white/50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
            Network
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">Explorer</span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
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

      <main className="flex-1 overflow-y-auto px-8 py-6">
        {selectedBlock === null ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Search the chain</p>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-5">
                Block, transaction, or address
              </h2>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="text-slate-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0x... address, transaction hash, block number, or username.cmu"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 font-bold">Ctrl+K</kbd>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                    <svg className="text-blue-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Chain height</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{networkHeight}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Latest</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center">
                    <svg className="text-indigo-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Block time</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{EMPTY_STAT_LABEL}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No indexer available</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center">
                    <svg className="text-emerald-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Transactions</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{EMPTY_COUNT_LABEL}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{EMPTY_STAT_LABEL}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-amber-50 flex items-center justify-center">
                    <svg className="text-amber-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Active addrs</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{EMPTY_COUNT_LABEL}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{EMPTY_STAT_LABEL}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-fuchsia-50 flex items-center justify-center">
                    <svg className="text-fuchsia-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Difficulty</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{networkDifficulty}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Current</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chain timeline</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Latest blocks — newest on the right</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  <span className="text-[10px] font-bold">{isConnected ? 'Connected' : 'Offline'}</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 overflow-x-auto pb-2">
                {TIMELINE_BLOCKS.length > 0 ? TIMELINE_BLOCKS.map((_, i) => (
                  <div key={i} />
                )) : (
                  <div className="w-full py-8 flex flex-col items-center justify-center">
                    <svg className="text-slate-300 mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                    <p className="text-xs text-slate-400 mt-0.5">Block timeline requires an indexer</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-[2] min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('blocks')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'blocks' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Latest blocks</button>
                    <button onClick={() => setActiveTab('transactions')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'transactions' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Transactions</button>
                    <button onClick={() => setActiveTab('accounts')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'accounts' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Top accounts</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">Auto-refresh</span>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${isConnected ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                      {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      <span className={`text-[9px] font-bold uppercase ${isConnected ? 'text-emerald-600' : 'text-slate-500'}`}>{isConnected ? 'Live' : 'Off'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  {activeTab === 'blocks' && (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Block</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Miner / Hash</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Txs</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Reward</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Age</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {LATEST_BLOCKS.length > 0 ? LATEST_BLOCKS.map((_, i) => (
                          <tr key={i}><td /></tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center">
                              <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                              <p className="text-xs text-slate-400 mt-1">Block data requires an indexer</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'transactions' && (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Hash</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">From</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">To</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Amount</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Age</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {TRANSACTIONS.length > 0 ? TRANSACTIONS.map((_, i) => (
                          <tr key={i}><td /></tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center">
                              <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                              <p className="text-xs text-slate-400 mt-1">Transaction data requires an indexer</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'accounts' && (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">#</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Address</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Tag</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Balance</th>
                          <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">% Supply</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {TOP_ACCOUNTS.length > 0 ? TOP_ACCOUNTS.map((_, i) => (
                          <tr key={i}><td /></tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center">
                              <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                              <p className="text-xs text-slate-400 mt-1">Account data requires an indexer</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800">Miner distribution</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-5">Share of blocks mined - past 24 hours</p>

                <div className="space-y-4">
                  {MINER_DISTRIBUTION.length > 0 ? MINER_DISTRIBUTION.map((_, i) => (
                    <div key={i} />
                  )) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <svg className="text-slate-300 mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                      <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                      <p className="text-xs text-slate-400 mt-0.5">Distribution requires an indexer</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 h-2 flex rounded-full overflow-hidden gap-0.5">
                  {MINER_DISTRIBUTION.length > 0 ? MINER_DISTRIBUTION.map((_, i) => (
                    <div key={i} className="h-full bg-slate-200" />
                  )) : (
                    <div className="h-full w-full bg-slate-100" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <button 
              onClick={() => setSelectedBlock(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">Block</p>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight font-mono">{selectedBlock}</h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-5">Overview</h3>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="text-slate-300 mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <p className="text-sm font-medium text-slate-400">Block detail not available</p>
                <p className="text-xs text-slate-400 mt-1">Block inspection requires an indexer backend</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export { Explorer }
