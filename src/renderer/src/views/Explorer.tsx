import { useState, useEffect, useRef, type JSX } from 'react'
import { useNetworkStats, useRecentBlocks } from '@/hooks'
import { call, fetchBalance, generateIdenticonGradient } from '@/services'
import { formatBlockNumber, formatDifficulty } from '@/utils'

interface ExplorerProps {
  activeWalletAddress: string | null
}

type TabState = 'blocks' | 'transactions' | 'accounts'

const TRANSACTIONS: never[] = []
const MINER_DISTRIBUTION: never[] = []

const EMPTY_STAT_LABEL = '--'
const EMPTY_COUNT_LABEL = '0'

function formatAge(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000) - timestamp
  if (diff < 0) return 'Just now'
  if (diff < 60) return `${diff} secs ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
  return `${Math.floor(diff / 3600)} hrs ago`
}

function hexToAscii(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  let str = ''
  for (let i = 0; i < cleaned.length; i += 2) {
    const charCode = parseInt(cleaned.substr(i, 2), 16)
    if (charCode > 0 && charCode < 127) {
      str += String.fromCharCode(charCode)
    }
  }
  return str
}

function AddressBadge({ address, leftAligned = false }: { address: string | null, leftAligned?: boolean }) {
  if (!address) return <span className="text-sm text-slate-400 font-mono">0x0 (Contract Creation)</span>
  const display = `${address.substring(0, 10)}...${address.substring(address.length - 8)}`
  return (
    <div className={`flex items-center gap-1.5 ${leftAligned ? 'justify-start' : 'justify-end'}`}>
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: generateIdenticonGradient(address) }} />
      <span className="text-sm font-mono text-blue-600 cursor-pointer hover:underline" title={address}>
        {display}
      </span>
      <svg className="text-slate-300 ml-0.5 cursor-pointer hover:text-slate-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    </div>
  )
}

/**
 * Explorer view featuring a global search, network statistics sourced from
 * the remote Core-geth JSON-RPC node, and placeholder tabbed data tables
 * for blocks, transactions, and accounts. Chain Height is populated from
 * the real eth_blockNumber response. All other statistical values display
 * placeholder labels until an indexer backend is available. Uses Tailwind
 * CSS for all styling.
 * @returns The explorer interface with real block height and empty data tables.
 */
function Explorer({ activeWalletAddress }: ExplorerProps): JSX.Element {
  const networkStats = useNetworkStats()
  const isConnected = networkStats.isConnected

  const recentBlocks = useRecentBlocks(networkStats.blockHeight, isConnected)
  const [, setCurrentTime] = useState<number>(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 5000)
    return () => clearInterval(interval)
  }, [])

  type ViewState = 'MAIN' | 'BLOCK_DETAIL' | 'TX_DETAIL'
  const [currentView, setCurrentView] = useState<ViewState>('MAIN')
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null)
  const [selectedTx, setSelectedTx] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<TabState>('blocks')

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')

  const [topAccounts, setTopAccounts] = useState<{address: string, balance: number}[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return
    
    const val = searchValue.trim()
    let result: any = null

    if (!isNaN(Number(val)) && val !== '') {
      const hexValue = "0x" + Number(val).toString(16)
      result = await call('eth_getBlockByNumber', [hexValue, true])
    } else if (val.startsWith('0x') && val.length === 66) {
      result = await call('eth_getBlockByHash', [val, true])
      if (!result) {
        result = await call('eth_getTransactionByHash', [val])
      }
    }

    if (result && result.number !== undefined) {
      setSelectedBlock(result)
      setCurrentView('BLOCK_DETAIL')
      setSearchValue('')
    } else if (result && result.blockHash) {
      setSelectedTx(result)
      setCurrentView('TX_DETAIL')
      setSearchValue('')
    }
  }

  const handleBlockSelect = async (blockNum: number) => {
    const hex = "0x" + blockNum.toString(16)
    const blockData = await call('eth_getBlockByNumber', [hex, true])
    if (blockData && blockData.number !== undefined) {
      setSelectedBlock(blockData)
      setCurrentView('BLOCK_DETAIL')
    }
  }

  useEffect(() => {
    async function loadAccounts() {
      if (!isConnected) return
      setIsLoadingAccounts(true)
      const addresses = new Set<string>()
      if (activeWalletAddress) addresses.add(activeWalletAddress.toLowerCase())
      recentBlocks.forEach(b => addresses.add(b.miner.toLowerCase()))
      
      const uniqueAddresses = Array.from(addresses)
      if (uniqueAddresses.length === 0) {
        setIsLoadingAccounts(false)
        return
      }

      const balances = await Promise.all(uniqueAddresses.map(async addr => {
        const balStr = await fetchBalance(addr)
        const num = parseFloat(balStr?.replace(/,/g, '') || '0')
        return { address: addr, balance: isNaN(num) ? 0 : num }
      }))

      balances.sort((a, b) => b.balance - a.balance)
      setTopAccounts(balances)
      setIsLoadingAccounts(false)
    }
    
    if (activeTab === 'accounts') {
      loadAccounts()
    }
  }, [activeTab, recentBlocks, activeWalletAddress, isConnected])

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
        {currentView === 'MAIN' ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Search the chain</p>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-5">
                Block, transaction, or address
              </h2>
              
              <form onSubmit={handleSearch} className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="text-slate-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0x... address, transaction hash, block number, or username.cmu"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 font-bold">Ctrl+K</kbd>
                </div>
              </form>
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
                {recentBlocks.length > 0 ? recentBlocks.map((block) => (
                  <div key={block.hash} className="flex-1 flex flex-col items-center">
                    <div className="w-full h-1 bg-emerald-500 rounded-full mb-2" />
                    <p className="text-[10px] font-bold text-slate-700">#{block.number}</p>
                    <p className="text-[9px] text-slate-400">{block.txCount} txs</p>
                  </div>
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
                        {recentBlocks.length > 0 ? recentBlocks.map((block) => (
                          <tr key={block.hash} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline" onClick={() => handleBlockSelect(block.number)}>#{block.number}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="text-xs font-mono text-slate-800">{block.miner.substring(0, 10)}...{block.miner.substring(block.miner.length - 8)}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Hash: {block.hash.substring(0, 14)}...</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="text-xs font-semibold text-slate-700">{block.txCount}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-bold text-slate-800">5.00</p>
                                <span className="text-[9px] font-semibold text-slate-400">CMU</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <p className="text-[10px] text-slate-500">{formatAge(block.timestamp)}</p>
                            </td>
                          </tr>
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
                        {isLoadingAccounts ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center">
                              <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-3" />
                              <p className="text-sm font-medium text-slate-400">Loading accounts...</p>
                            </td>
                          </tr>
                        ) : topAccounts.length > 0 ? topAccounts.map((acc, i) => (
                          <tr key={acc.address} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="text-xs font-bold text-slate-500">{i + 1}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-slate-200 flex-shrink-0" />
                                <p className="text-xs font-mono text-blue-600">{acc.address.substring(0, 10)}...{acc.address.substring(acc.address.length - 8)}</p>
                                {acc.address.toLowerCase() === activeWalletAddress?.toLowerCase() && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[9px] font-bold text-blue-600 uppercase tracking-wider">You</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-medium text-slate-500">Miner</span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <p className="text-xs font-bold text-slate-800">{acc.balance.toLocaleString(undefined, { minimumFractionDigits: acc.balance % 1 === 0 ? 1 : 2, maximumFractionDigits: 2 })}</p>
                                <span className="text-[9px] font-semibold text-slate-400">CMU</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <p className="text-[10px] text-slate-500">-- %</p>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center">
                              <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                              <p className="text-xs text-slate-400 mt-1">Account data requires an indexer or active network</p>
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
        ) : currentView === 'BLOCK_DETAIL' && selectedBlock ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <button 
              onClick={() => setCurrentView('MAIN')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">Block</p>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight font-mono">{parseInt(selectedBlock.number, 16)}</h2>
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-5">Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Block Height:</span>
                    <span className="text-sm font-mono text-slate-800 text-right">{parseInt(selectedBlock.number, 16)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Status:</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Finalized
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Timestamp:</span>
                    <span className="text-sm text-slate-800 text-right">{new Date(parseInt(selectedBlock.timestamp, 16) * 1000).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Hash:</span>
                    <span className="text-sm font-mono text-slate-800 text-right">{selectedBlock.hash}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Parent Hash:</span>
                    <span className="text-sm font-mono text-slate-800 text-right break-all">{selectedBlock.parentHash}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Miner:</span>
                    <AddressBadge address={selectedBlock.miner} />
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Nonce:</span>
                    <span className="text-sm font-mono text-slate-800 text-right">{parseInt(selectedBlock.nonce, 16).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Difficulty:</span>
                    <span className="text-sm font-mono text-slate-800 text-right">{parseInt(selectedBlock.difficulty, 16).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Block Size:</span>
                    <span className="text-sm font-mono text-slate-800 text-right">{parseInt(selectedBlock.size, 16).toLocaleString()} bytes</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Transactions:</span>
                    <span className="text-sm font-mono text-slate-800 text-right">{selectedBlock.transactions?.length || 0} transactions</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 w-1/3">Gas Used / Gas Limit:</span>
                    <span className="text-sm font-mono text-slate-800 text-right">{parseInt(selectedBlock.gasUsed, 16).toLocaleString()} / {parseInt(selectedBlock.gasLimit, 16).toLocaleString()}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-slate-500 w-1/3 pt-1">Extra Data:</span>
                    <div className="text-right flex-1">
                      <p className="text-sm font-mono text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">{selectedBlock.extraData}</p>
                      <p className="text-[10px] text-slate-500 mt-2 italic font-mono px-1">Ascii: {hexToAscii(selectedBlock.extraData) || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Block Reward</h3>
                  <p className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">+10.00 <span className="text-sm font-medium text-slate-400">CMU</span></p>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
                  <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">Chain Position</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      parseInt(selectedBlock.number, 16) - 3,
                      parseInt(selectedBlock.number, 16) - 2,
                      parseInt(selectedBlock.number, 16) - 1,
                      parseInt(selectedBlock.number, 16),
                      parseInt(selectedBlock.number, 16) + 1
                    ].map(num => {
                      if (num < 0) return null
                      const isCurrent = num === parseInt(selectedBlock.number, 16)
                      return (
                        <div key={num} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-blue-50 border border-blue-100' : ''}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            </svg>
                          </div>
                          <span className={`text-sm font-mono font-bold cursor-pointer hover:underline ${isCurrent ? 'text-blue-700' : 'text-slate-500'}`} onClick={() => handleBlockSelect(num)}>
                            #{num}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Transactions in this block</h3>
              <p className="text-[10px] text-slate-400 mb-5">{selectedBlock.transactions?.length || 0} entries</p>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Hash</th>
                    <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">From</th>
                    <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">To</th>
                    <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Amount</th>
                    <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedBlock.transactions && selectedBlock.transactions.length > 0 ? (
                    selectedBlock.transactions.map((tx: any) => (
                      <tr key={tx.hash} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-2 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                            </div>
                            <span className="text-xs font-mono text-blue-600 cursor-pointer hover:underline" onClick={() => { setSelectedTx(tx); setCurrentView('TX_DETAIL') }}>
                              {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-3.5">
                          <AddressBadge address={tx.from} leftAligned />
                        </td>
                        <td className="px-2 py-3.5">
                          <AddressBadge address={tx.to} leftAligned />
                        </td>
                        <td className="px-2 py-3.5 text-right">
                          <span className="text-xs font-bold text-slate-800">
                            {(parseInt(tx.value, 16) / 1e18).toFixed(4)} CMU
                          </span>
                        </td>
                        <td className="px-2 py-3.5 text-right">
                          <span className="text-[10px] text-slate-500">
                            {formatAge(parseInt(selectedBlock.timestamp, 16))}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2 py-12 text-center">
                        <p className="text-sm font-medium text-slate-400">No transactions found in this block</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : currentView === 'TX_DETAIL' && selectedTx ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (selectedBlock && selectedBlock.number === selectedTx.blockNumber) {
                    setCurrentView('BLOCK_DETAIL')
                  } else {
                    handleBlockSelect(parseInt(selectedTx.blockNumber, 16))
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
              
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-0.5">Transaction</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight font-mono">{selectedTx.hash}</h2>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg> 
                    Success
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Transaction hash:</span>
                  <span className="text-sm font-mono text-slate-800">{selectedTx.hash}</span>
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Status:</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg> 
                    Confirmed
                  </span>
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Block:</span>
                  <span className="text-sm font-mono text-blue-600 cursor-pointer hover:underline" onClick={() => handleBlockSelect(parseInt(selectedTx.blockNumber, 16))}>
                    #{parseInt(selectedTx.blockNumber, 16)}
                  </span>
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">From:</span>
                  <AddressBadge address={selectedTx.from} leftAligned />
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">To:</span>
                  <AddressBadge address={selectedTx.to} leftAligned />
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Value:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {(parseInt(selectedTx.value, 16) / 1e18).toFixed(4)} CMU
                  </span>
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Gas price:</span>
                  <span className="text-sm text-slate-800">
                    {parseInt(selectedTx.gasPrice, 16) / 1e9} gwei
                  </span>
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Gas used:</span>
                  <span className="text-sm text-slate-800">
                    {parseInt(selectedTx.gas, 16).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Transaction fee:</span>
                  <span className="text-sm text-slate-800">
                    {((parseInt(selectedTx.gas, 16) * parseInt(selectedTx.gasPrice, 16)) / 1e18).toFixed(6)} CMU
                  </span>
                </div>
                <div className="flex items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 w-1/4">Nonce:</span>
                  <span className="text-sm text-slate-800">{parseInt(selectedTx.nonce, 16)}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-xs font-semibold text-slate-500 w-1/4 pt-1">Input data:</span>
                  <div className="flex-1">
                    <p className="text-sm font-mono text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {selectedTx.input}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export { Explorer }
