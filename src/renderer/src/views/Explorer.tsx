import { useState, type JSX } from 'react'
import { useNetworkStats, useRpcPort } from '@/hooks'

type TabState = 'blocks' | 'transactions' | 'accounts'

const NETWORK_STATS = {
  height: '28,532',
  blockTime: '30.4s',
  txs: '1.92M',
  txsChange: '↑ 4.2% past 24h',
  activeAddrs: '8,412',
  difficulty: '14.2M'
}

const TIMELINE_BLOCKS = [
  { num: '#8521', txs: '3 tx', time: '5m 30s ago', status: 'normal' },
  { num: '#8522', txs: '4 tx', time: '5m 0s ago', status: 'normal' },
  { num: '#8523', txs: '5 tx', time: '4m 30s ago', status: 'normal' },
  { num: '#8524', txs: '6 tx', time: '4m 0s ago', status: 'normal' },
  { num: '#8525', txs: '0 tx', time: '3m 30s ago', status: 'success' },
  { num: '#8526', txs: '1 tx', time: '3m 0s ago', status: 'normal' },
  { num: '#8527', txs: '2 tx', time: '2m 30s ago', status: 'normal' },
  { num: '#8528', txs: '3 tx', time: '2m 0s ago', status: 'normal' },
  { num: '#8529', txs: '4 tx', time: '1m 30s ago', status: 'normal' },
  { num: '#8530', txs: '5 tx', time: '1m 0s ago', status: 'success' },
  { num: '#8531', txs: '6 tx', time: '0m 30s ago', status: 'normal' },
  { num: '#8532', txs: '0 tx', time: '8s ago', status: 'active' }
]

const LATEST_BLOCKS = [
  { num: '#28,533', miner: 'campuspool.cmu', hash: '0x4327cfcb...ce1c', txs: 1, reward: '+10.00', time: '8s ago', gradient: 'from-amber-400 to-pink-500' },
  { num: '#28,532', miner: '0xa2c1...ef00', hash: '0x4327358c...7ff0', txs: 0, reward: '+10.00', time: '0m 30s ago', gradient: 'from-red-400 to-rose-500' },
  { num: '#28,531', miner: 'foundation.cmu', hash: '0x43269b4d...31c4', txs: 6, reward: '+10.00', time: '1m 0s ago', gradient: 'from-blue-400 to-indigo-500' },
  { num: '#28,530', miner: 'main.cmu', isYou: true, hash: '0x4326010e...e398', txs: 5, reward: '+10.00', time: '1m 30s ago', gradient: 'from-emerald-400 to-emerald-600' },
  { num: '#28,529', miner: 'validator-3', hash: '0x432566cf...956c', txs: 4, reward: '+10.00', time: '2m 0s ago', gradient: 'from-fuchsia-500 to-purple-600' }
]

const TRANSACTIONS = [
  { type: 'reward', hash: '0x00000000...e8d369', from: '0x0000...71db', to: '0x0000...4e2d', amount: '7.93', time: '8s ago' },
  { type: 'tx', hash: '0x00000000...f05902', from: '0x0000...7846', to: '0x0000...5d4a', amount: '14.82', time: '16s ago' },
  { type: 'tx', hash: '0x00000000...f7de9b', from: '0x0000...7eb1', to: '0x0000...6c67', amount: '21.71', time: '24s ago' },
  { type: 'contract', hash: '0x00000000...ff6434', from: '0x0000...851c', to: '0x0000...7b84', amount: '28.60', time: '32s ago' },
  { type: 'tx', hash: '0x00000000...06e9cd', from: '0x0000...8b87', to: '0x0000...8aa1', amount: '35.49', time: '40s ago' }
]

const TOP_ACCOUNTS = [
  { rank: '01', address: '0xCointM...9900aa', tag: 'Foundation reserve', balance: '1,240,000', supply: '12.40%', gradient: 'from-blue-400 to-indigo-500' },
  { rank: '02', address: '0xC0a7d4...7e90a1', tag: 'main.cmu (you)', balance: '1,285', supply: '0.01%', gradient: 'from-emerald-400 to-emerald-600' },
  { rank: '03', address: '0x4F9d12...A77B88', tag: 'Mining payout', balance: '412', supply: '0.00%', gradient: 'from-violet-400 to-fuchsia-500' },
  { rank: '04', address: '0xa2c177...cdef00', tag: 'campuspool.cmu', balance: '88,400', supply: '0.88%', gradient: 'from-red-400 to-rose-500' },
  { rank: '05', address: '0xc0ffee...445566', tag: 'CMU Staking Pool', balance: '410,220', supply: '4.10%', gradient: 'from-purple-500 to-indigo-500' }
]

const MINER_DISTRIBUTION = [
  { name: 'main.cmu (you)', percent: '8.4%', color: 'bg-emerald-500' },
  { name: 'foundation.cmu', percent: '28.1%', color: 'bg-blue-500' },
  { name: 'campuspool.cmu', percent: '22.5%', color: 'bg-amber-400' },
  { name: 'validator-3', percent: '18.7%', color: 'bg-purple-500' },
  { name: '0xa2c1...ef00', percent: '12.4%', color: 'bg-red-500' },
  { name: 'others (12)', percent: '9.9%', color: 'bg-slate-400' }
]

const BLOCK_DETAIL = {
  height: '#28,534',
  timestamp: 'May 28, 2026, 7:48:05 PM GMT+7',
  hash: '0x43286a0aabcdef0011223344',
  parentHash: '0x4327cfcbabcdef0011223344',
  miner: '0x4F9d...7B88',
  nonce: '5,394,760',
  difficulty: '14,182,300',
  size: '1.36 KB',
  txCount: '2 transactions',
  reward: '+10.00',
  position: ['#28,531', '#28,532', '#28,533', '#28,534', '#28,535']
}

/**
 * Explorer view featuring a global search, network statistics, chain timeline,
 * a tabbed data table (Latest blocks, Transactions, Top accounts), and a detail
 * view for specific blocks. Uses Tailwind CSS for all styling.
 * @returns The explorer interface with dynamic routing between Home and Detail views.
 */
function Explorer(): JSX.Element {
  const { port } = useRpcPort()
  const networkStats = useNetworkStats(port)
  const isConnected = networkStats.isConnected

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabState>('blocks')

  const networkHeight = isConnected ? NETWORK_STATS.height : '--'
  const networkBlockTime = isConnected ? NETWORK_STATS.blockTime : '--'
  const networkTxs = isConnected ? NETWORK_STATS.txs : '0'
  const networkTxsChange = isConnected ? NETWORK_STATS.txsChange : '--'
  const networkActiveAddrs = isConnected ? NETWORK_STATS.activeAddrs : '0'
  const networkDifficulty = isConnected ? NETWORK_STATS.difficulty : '--'

  const timelineBlocks = isConnected ? TIMELINE_BLOCKS : []
  const latestBlocks = isConnected ? LATEST_BLOCKS : []
  const transactions = isConnected ? TRANSACTIONS : []
  const topAccounts = isConnected ? TOP_ACCOUNTS : []
  const minerDistribution = isConnected ? MINER_DISTRIBUTION : []

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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-50 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wide">Block # 28,534</span>
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
                  <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 font-bold">⌘K</kbd>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">Block #28530</span>
                <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">0xC0a7...90a1</span>
                <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">tx 0x4a8b...11c2</span>
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
                <p className="text-xl font-bold text-slate-800">{networkBlockTime}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Past 100 blocks</p>
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
                <p className="text-xl font-bold text-slate-800">{networkTxs}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{networkTxsChange}</p>
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
                <p className="text-xl font-bold text-slate-800">{networkActiveAddrs}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">past 24 hours</p>
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
                <p className="text-[10px] text-slate-400 mt-0.5">↑ 0.3% retarget</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chain timeline</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Latest 12 blocks — newest on the right</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold">Updating - 30s</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 overflow-x-auto pb-2">
                {timelineBlocks.length > 0 ? timelineBlocks.map((block, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => setSelectedBlock(block.num)}>
                    <div className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center relative ${
                      block.status === 'success' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                      block.status === 'active' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' :
                      'bg-slate-50 border border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}>
                      {(block.status === 'success' || block.status === 'active') && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg className="text-emerald-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                      <span className={`text-[8px] font-bold tracking-wider uppercase opacity-70 ${block.status === 'normal' ? 'text-slate-400' : ''}`}>Block</span>
                      <span className="text-[11px] font-bold font-mono my-0.5">{block.num}</span>
                      <span className={`text-[9px] ${block.status === 'normal' ? 'text-slate-500' : 'opacity-90'}`}>{block.txs}</span>
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">{block.time}</span>
                  </div>
                )) : (
                  <div className="w-full py-8 text-center text-sm font-medium text-slate-400">
                    Waiting for network sync...
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
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Live</span>
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
                        {latestBlocks.length > 0 ? latestBlocks.map((block, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedBlock(block.num)}>
                            <td className="px-5 py-4">
                              <span className="text-sm font-bold text-blue-500 font-mono">{block.num}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${block.gradient}`} />
                                  <span className="text-xs font-semibold text-slate-800 font-mono">{block.miner}</span>
                                  {block.isYou && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">You</span>}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono ml-6">{block.hash}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs font-medium text-slate-700">{block.txs}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-emerald-600">{block.reward}</span>
                                <span className="text-[9px] font-medium text-emerald-600/70">CMU</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-xs text-slate-500">{block.time}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm font-medium text-slate-400">
                              No data available
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
                        {transactions.length > 0 ? transactions.map((tx, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tx.type === 'reward' ? 'bg-emerald-50' : tx.type === 'contract' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                                  {tx.type === 'reward' && <svg className="text-emerald-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                  {tx.type === 'contract' && <svg className="text-purple-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                                  {tx.type === 'tx' && <svg className="text-blue-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-blue-500 font-mono leading-tight">{tx.hash.split('...')[0]}...</span>
                                  <span className="text-[11px] font-bold text-blue-500 font-mono leading-tight">{tx.hash.split('...')[1]}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                                <div className="flex flex-col">
                                  <span className="text-[11px] text-slate-600 font-mono leading-tight">{tx.from.split('...')[0]}...</span>
                                  <span className="text-[11px] text-slate-600 font-mono leading-tight">{tx.from.split('...')[1]}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <svg className="text-slate-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                                  <div className="flex flex-col">
                                    <span className="text-[11px] text-slate-600 font-mono leading-tight">{tx.to.split('...')[0]}...</span>
                                    <span className="text-[11px] text-slate-600 font-mono leading-tight">{tx.to.split('...')[1]}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-xs font-bold text-slate-800">{tx.amount}</span>
                              <span className="text-[9px] font-medium text-slate-400 ml-1">CMU</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-xs text-slate-500">{tx.time}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm font-medium text-slate-400">
                              No data available
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
                        {topAccounts.length > 0 ? topAccounts.map((acc, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                            <td className="px-5 py-4">
                              <span className="text-[11px] font-medium text-slate-400 font-mono">{acc.rank}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${acc.gradient}`} />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-blue-500 font-mono leading-tight">{acc.address.split('...')[0]}...</span>
                                  <span className="text-[11px] font-bold text-blue-500 font-mono leading-tight">{acc.address.split('...')[1]}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs font-bold text-slate-800">{acc.tag}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-xs font-bold text-slate-800">{acc.balance}</span>
                              <span className="text-[9px] font-medium text-slate-400 ml-1">CMU</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-xs font-medium text-slate-500">{acc.supply}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm font-medium text-slate-400">
                              No data available
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
                  {minerDistribution.length > 0 ? minerDistribution.map((miner, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${miner.color}`} />
                        <span className="text-xs font-semibold text-slate-700">{miner.name}</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">{miner.percent}</span>
                    </div>
                  )) : (
                    <div className="py-4 text-center text-sm font-medium text-slate-400">
                      No data available
                    </div>
                  )}
                </div>

                <div className="mt-5 h-2 flex rounded-full overflow-hidden gap-0.5">
                  {minerDistribution.length > 0 ? minerDistribution.map((miner, i) => (
                    <div key={i} className={`h-full ${miner.color}`} style={{ width: miner.percent }} />
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

            <div className="grid grid-cols-[1.5fr_1fr] gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-5">Overview</h3>
                
                <div className="space-y-4">
                  <div className="flex py-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Block height</span>
                    <span className="text-xs font-medium text-slate-800 font-mono">{BLOCK_DETAIL.height}</span>
                  </div>
                  <div className="flex py-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Status</span>
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded text-emerald-600 border border-emerald-100">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-[10px] font-bold">Finalized - 1 confirmations</span>
                    </div>
                  </div>
                  <div className="flex py-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Timestamp</span>
                    <span className="text-xs font-bold text-slate-800">{BLOCK_DETAIL.timestamp}</span>
                  </div>
                  <div className="flex py-1 border-t border-slate-100 pt-4 mt-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Block hash</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-800 font-mono break-all">{BLOCK_DETAIL.hash}</span>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex py-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Parent hash</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-500 font-mono break-all cursor-pointer hover:underline">{BLOCK_DETAIL.parentHash}</span>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex py-1 border-t border-slate-100 pt-4 mt-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Miner</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500" />
                      <span className="text-xs font-medium text-blue-500 font-mono cursor-pointer hover:underline">{BLOCK_DETAIL.miner}</span>
                    </div>
                  </div>
                  <div className="flex py-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Nonce</span>
                    <span className="text-xs font-medium text-slate-800 font-mono">{BLOCK_DETAIL.nonce}</span>
                  </div>
                  <div className="flex py-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Difficulty</span>
                    <span className="text-xs font-medium text-slate-800 font-mono">{BLOCK_DETAIL.difficulty}</span>
                  </div>
                  <div className="flex py-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Block size</span>
                    <span className="text-xs font-bold text-slate-800">{BLOCK_DETAIL.size}</span>
                  </div>
                  <div className="flex py-1 border-t border-slate-100 pt-4 mt-1">
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-slate-500">Transactions</span>
                    <span className="text-xs font-bold text-slate-800">{BLOCK_DETAIL.txCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-inner flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 mb-1">Reward</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-emerald-600 tracking-tight">{BLOCK_DETAIL.reward}</span>
                  <span className="text-xl font-bold text-slate-600">CMU</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mb-8">Static block reward (PoW)</p>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mt-auto">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-3">Chain position</p>
                  <div className="flex items-center gap-1">
                    {BLOCK_DETAIL.position.map((pos, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className={`px-2 py-1.5 rounded text-[10px] font-bold font-mono border ${pos === selectedBlock ? 'bg-blue-500 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200'}`}>
                          {pos}
                        </span>
                        {i < BLOCK_DETAIL.position.length - 1 && (
                          <span className="text-slate-300 text-xs">&rsaquo;</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Transactions in this block</h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">Hash</th>
                    <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">From</th>
                    <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">To</th>
                    <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TRANSACTIONS.slice(0, 2).map((tx, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tx.type === 'reward' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                            {tx.type === 'reward' ? (
                              <svg className="text-emerald-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : (
                              <svg className="text-blue-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-blue-500 font-mono">{tx.hash}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                          <span className="text-[11px] text-slate-600 font-mono">{tx.from}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <svg className="text-slate-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                            <span className="text-[11px] text-slate-600 font-mono">{tx.to}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-xs font-bold text-slate-800">{tx.amount}</span>
                        <span className="text-[9px] font-medium text-slate-400 ml-1">CMU</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export { Explorer }
