import { useState, type JSX } from 'react'
import { deriveAccount, generateIdenticonGradient, type DerivedAccount } from '@/services'
type WalletTab = 'activity' | 'tokens' | 'nfts'

const WALLET_TABS = [
  { id: 'activity' as const, label: 'Activity' },
  { id: 'tokens' as const, label: 'Tokens' },
  { id: 'nfts' as const, label: 'NFTs' }
]

interface WalletProps {
  accounts: DerivedAccount[]
  setAccounts: (accounts: DerivedAccount[]) => void
  activeWalletAddress: string | null
  setActiveWalletAddress: (address: string) => void
  balance: string
}



const WATCH_LIST: never[] = []
const TRANSACTIONS: never[] = []
const TOKEN_LIST: never[] = []
const NFT_COLLECTION: never[] = []


/**
 * Comprehensive wallet management view with a split-pane layout featuring
 * an accounts sidebar, a hero card displaying the selected account details
 * with action buttons, and a tabbed content area switching between Activity
 * (transaction history), Tokens (ERC-20 balances table), and NFTs (ERC-721/1155
 * card grid). All layout uses Tailwind CSS utility classes exclusively.
 * @returns The complete wallet view with account list, hero card, and tabbed content.
 */
function Wallet({
  accounts,
  setAccounts,
  activeWalletAddress,
  setActiveWalletAddress,
  balance
}: WalletProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<WalletTab>('activity')

  const activeAccount = accounts.find(a => a.address === activeWalletAddress) || accounts[0]
  const activeGradient = activeAccount ? generateIdenticonGradient(activeAccount.address) : 'from-slate-400 to-slate-500'

  const handleAccountSwitch = async (address: string): Promise<void> => {
    await window.api.settings.set('activeWalletAddress', address)
    setActiveWalletAddress(address)
  }

  const handleAddAccount = async (): Promise<void> => {
    try {
      const mnemonic = await window.api.settings.get('mnemonic')
      if (!mnemonic) return

      const newIndex = accounts.length
      const newAccount = deriveAccount(mnemonic, newIndex, `Account ${newIndex + 1}`)
      
      const updatedAccounts = [...accounts, newAccount]
      await window.api.settings.set('accounts', updatedAccounts)
      setAccounts(updatedAccounts)
      
      await handleAccountSwitch(newAccount.address)
    } catch (e) {
      console.error('Failed to derive new account:', e)
    }
  }

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

          <button 
            onClick={handleAddAccount}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
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
                {accounts.map((acc, i) => {
                  const gradient = generateIdenticonGradient(acc.address)
                  const abbrAddress = `${acc.address.substring(0, 6)}...${acc.address.substring(acc.address.length - 4)}`
                  const isSelected = acc.address === activeWalletAddress

                  return (
                    <button
                      key={i}
                      onClick={() => handleAccountSwitch(acc.address)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-white border border-slate-200 shadow-sm'
                          : 'hover:bg-white/60 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700 truncate">{acc.label}</p>
                          <p className="text-xs font-bold text-slate-800 ml-2">{isSelected ? balance : '0.00'}</p>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[10px] text-slate-400 font-mono" title={acc.address}>{abbrAddress}</p>
                          <p className="text-[10px] text-slate-400">CMU</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">Watch List</h3>
              <div className="space-y-2">
                {WATCH_LIST.length > 0 ? WATCH_LIST.map((_, i) => (
                  <div key={i} />
                )) : (
                  <p className="text-xs text-slate-400 px-3 py-2">No watched addresses</p>
                )}
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
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeGradient}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{activeAccount?.label}</p>
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-white/50 bg-white/10 px-1.5 py-0.5 rounded">EOA</span>
                      </div>
                      <p className="text-xs text-white/50 font-mono mt-0.5">{activeAccount?.address}</p>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-lg bg-white p-1.5">
                    <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:6px_6px] rounded-sm" />
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-4xl font-bold tracking-tight">{balance}</span>
                    <span className="text-lg font-semibold text-white/60">CMU</span>
                  </div>
                  <p className="text-sm text-white/40 mt-1">
                    Balance from node
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
                  {TRANSACTIONS.length > 0 ? TRANSACTIONS.map((_, i) => (
                    <div key={i} />
                  )) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <svg className="text-slate-300 mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <p className="text-sm font-medium text-slate-400">No activity yet</p>
                      <p className="text-xs text-slate-400 mt-1">Transactions will appear here once you send or receive CMU</p>
                    </div>
                  )}
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
                      {TOKEN_LIST.length > 0 ? TOKEN_LIST.map((_, i) => (
                        <tr key={i}><td /></tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-16 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <svg className="text-slate-300 mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                              </svg>
                              <p className="text-sm font-medium text-slate-400">No tokens detected</p>
                              <p className="text-xs text-slate-400 mt-1">ERC-20 tokens will appear here when indexed</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'nfts' && (
                <div className="rounded-2xl bg-white border border-slate-200">
                  {NFT_COLLECTION.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 p-4">
                      {NFT_COLLECTION.map((_, i) => (
                        <div key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <svg className="text-slate-300 mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-sm font-medium text-slate-400">No NFTs found</p>
                      <p className="text-xs text-slate-400 mt-1">ERC-721 and ERC-1155 tokens will appear here</p>
                    </div>
                  )}
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
