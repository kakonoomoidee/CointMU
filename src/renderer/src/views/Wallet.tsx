import { useState, type JSX } from 'react'

type WalletTab = 'activity' | 'tokens' | 'nfts'

const WALLET_TABS = [
  { id: 'activity' as const, label: 'Activity' },
  { id: 'tokens' as const, label: 'Tokens' },
  { id: 'nfts' as const, label: 'NFTs' }
]

interface AccountEntry {
  name: string
  address: string
  balance: string
  unit: string
  gradient: string
  selected?: boolean
}

const ACCOUNTS: AccountEntry[] = [
  { name: 'Main wallet', address: '0xC0a7...90a1', balance: '1,314.67', unit: 'CMU', gradient: 'from-emerald-400 to-emerald-600', selected: true },
  { name: 'Mining payout', address: '0x4F9d...7B88', balance: '412.3', unit: 'CMU', gradient: 'from-violet-400 to-fuchsia-500' },
  { name: 'dApp testing', address: '0x88aa...cc33', balance: '18.04', unit: 'CMU', gradient: 'from-lime-400 to-emerald-500' },
  { name: 'CMU-DAI Pool', address: '0xd31E...EE66', balance: '0', unit: 'CMU', gradient: 'from-amber-300 to-pink-400' }
]

const WATCH_LIST = [
  { name: 'CointMU Foundation', address: '0xfe1100...4b27' },
  { name: 'Treasury', address: '0x3b4cee...ee19' }
]

const TRANSACTIONS = [
  { type: 'reward' as const, label: 'Mining reward', detail: 'From mining pool - block #28510', amount: '+10.00', unit: 'CMU', time: '6s ago - 1 confs', positive: true },
  { type: 'sent' as const, label: 'Sent CMU', detail: 'To 0x8f1a3c...6e5f4a', amount: '-24.50', unit: 'CMU', time: '4m ago - 8 confs', positive: false },
  { type: 'reward' as const, label: 'Mining reward', detail: 'From mining pool - block #28506', amount: '+10.00', unit: 'CMU', time: '7m ago - 5 confs', positive: true },
  { type: 'contract' as const, label: 'Contract call', detail: 'To 0x4f9d12...a77b88', amount: '-0.12', unit: 'CMU', time: '22m ago - 44 confs', positive: false },
  { type: 'received' as const, label: 'Received CMU', detail: 'From 0xa91c...3f27', amount: '+75.00', unit: 'CMU', time: '1h ago - 120 confs', positive: true }
]

const TOKEN_LIST = [
  { symbol: 'CMU', name: 'CointMU', price: '$0.42', change: '+3.2%', changePositive: true, balance: '1,314.67', value: '$552.16', gradient: 'from-emerald-400 to-emerald-600' },
  { symbol: 'DAI', name: 'Dai Stablecoin', price: '$1.00', change: '+0.01%', changePositive: true, balance: '250.00', value: '$250.00', gradient: 'from-amber-400 to-amber-500' },
  { symbol: 'WCMU', name: 'Wrapped CMU', price: '$0.42', change: '+3.1%', changePositive: true, balance: '80.50', value: '$33.81', gradient: 'from-blue-400 to-blue-600' },
  { symbol: 'USDT', name: 'Tether USD', price: '$1.00', change: '-0.02%', changePositive: false, balance: '15.00', value: '$15.00', gradient: 'from-emerald-500 to-teal-500' },
  { symbol: 'LP-CMU', name: 'CMU-DAI LP Token', price: '$2.84', change: '+1.4%', changePositive: true, balance: '44.20', value: '$125.53', gradient: 'from-violet-400 to-fuchsia-500' }
]

const NFT_COLLECTION = [
  { id: 1, title: 'Certificate #014', collection: 'CointMU Edu', standard: 'ERC-721', gradient: 'from-red-400 via-orange-400 to-amber-300' },
  { id: 2, title: 'Builder Badge', collection: 'Genesis', standard: 'ERC-1155', gradient: 'from-violet-400 via-purple-400 to-fuchsia-400' },
  { id: 3, title: 'Hashstar 0x09', collection: 'Hashstars', standard: 'ERC-721', gradient: 'from-emerald-300 via-teal-400 to-cyan-500' },
  { id: 4, title: 'Validator Pass', collection: 'CointMU Core', standard: 'ERC-721', gradient: 'from-blue-400 via-indigo-400 to-violet-500' },
  { id: 5, title: 'Node License', collection: 'Genesis', standard: 'ERC-1155', gradient: 'from-pink-400 via-rose-400 to-red-400' },
  { id: 6, title: 'Miner Trophy', collection: 'Achievements', standard: 'ERC-1155', gradient: 'from-slate-300 via-zinc-200 to-stone-300' }
]

const HERO_ADDRESS_FULL = '0xC0a7d4...7e99a1'
const HERO_BALANCE = '1,314.67'
const HERO_USD = '$562.16'

/**
 * Comprehensive wallet management view with a split-pane layout featuring
 * an accounts sidebar, a hero card displaying the selected account details
 * with action buttons, and a tabbed content area switching between Activity
 * (transaction history), Tokens (ERC-20 balances table), and NFTs (ERC-721/1155
 * card grid). All layout uses Tailwind CSS utility classes exclusively.
 * @returns The complete wallet view with account list, hero card, and tabbed content.
 */
function Wallet(): JSX.Element {
  const [activeTab, setActiveTab] = useState<WalletTab>('activity')
  const [selectedAccount, setSelectedAccount] = useState<number>(0)

  const account = ACCOUNTS[selectedAccount]

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
            Workspace
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">Wallet</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">Synced</span>
          </div>

          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Backup
          </button>

          <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New account
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="flex gap-6 h-full">
          <div className="w-64 flex-shrink-0 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">Accounts</h3>
                <button className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                {ACCOUNTS.map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAccount(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                      selectedAccount === i
                        ? 'bg-white border border-slate-200 shadow-sm'
                        : 'hover:bg-white/60 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${acc.gradient} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700 truncate">{acc.name}</p>
                        <p className="text-xs font-bold text-slate-800 ml-2">{acc.balance}</p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[10px] text-slate-400 font-mono">{acc.address}</p>
                        <p className="text-[10px] text-slate-400">{acc.unit}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">Watch List</h3>
              <div className="space-y-2">
                {WATCH_LIST.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors py-2">
              + Import wallet
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 p-7 text-white relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/3 blur-sm" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${account.gradient}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{account.name}</p>
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-white/50 bg-white/10 px-1.5 py-0.5 rounded">EOA</span>
                      </div>
                      <p className="text-xs text-white/50 font-mono mt-0.5">{HERO_ADDRESS_FULL}</p>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-lg bg-white p-1.5">
                    <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:6px_6px] rounded-sm" />
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-4xl font-bold tracking-tight">{HERO_BALANCE}</span>
                    <span className="text-lg font-semibold text-white/60">CMU</span>
                  </div>
                  <p className="text-sm text-white/40 mt-1">
                    ~ {HERO_USD} - estimated
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 11 12 6 7 11" />
                      <line x1="12" y1="6" x2="12" y2="18" />
                    </svg>
                    Send
                  </button>
                  <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="7 13 12 18 17 13" />
                      <line x1="12" y1="6" x2="12" y2="18" />
                    </svg>
                    Receive
                  </button>
                  <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 014-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 01-4 4H3" />
                    </svg>
                    Swap
                  </button>
                  <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy address
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-slate-100/50">
                  {WALLET_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                        activeTab === tab.id
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-0.5">
                  Export
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {activeTab === 'activity' && (
                <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
                  {TRANSACTIONS.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          tx.type === 'reward'
                            ? 'bg-blue-50'
                            : tx.type === 'sent'
                              ? 'bg-amber-50'
                              : tx.type === 'received'
                                ? 'bg-emerald-50'
                                : 'bg-slate-100'
                        }`}>
                          {tx.type === 'reward' && (
                            <svg className="text-blue-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                          )}
                          {tx.type === 'sent' && (
                            <svg className="text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="17 11 12 6 7 11" />
                              <line x1="12" y1="6" x2="12" y2="18" />
                            </svg>
                          )}
                          {tx.type === 'received' && (
                            <svg className="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="7 13 12 18 17 13" />
                              <line x1="12" y1="6" x2="12" y2="18" />
                            </svg>
                          )}
                          {tx.type === 'contract' && (
                            <svg className="text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{tx.label}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.detail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold font-mono ${tx.positive ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {tx.amount}
                          <span className="text-[10px] font-medium text-slate-400 ml-1">{tx.unit}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{tx.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'tokens' && (
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">Token</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">Price</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">Balance</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TOKEN_LIST.map((token, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.gradient} flex-shrink-0`} />
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{token.symbol}</p>
                                <p className="text-[10px] text-slate-400">{token.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <p className="text-sm font-medium text-slate-800">{token.price}</p>
                            <p className={`text-[10px] font-medium ${token.changePositive ? 'text-emerald-500' : 'text-red-500'}`}>
                              {token.change}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <p className="text-sm font-semibold text-slate-800 font-mono">{token.balance}</p>
                            <p className="text-[10px] text-slate-400">{token.symbol}</p>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <p className="text-sm font-semibold text-slate-800">{token.value}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'nfts' && (
                <div className="grid grid-cols-3 gap-4">
                  {NFT_COLLECTION.map((nft) => (
                    <div key={nft.id} className="rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
                      <div className={`relative aspect-square bg-gradient-to-br ${nft.gradient} p-4`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <span className="text-[9px] font-bold tracking-wider text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                            {nft.standard}
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                          <div className="w-24 h-24 rounded-full bg-white/30 blur-xl" />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold text-slate-800">{nft.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{nft.collection}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export { Wallet }
