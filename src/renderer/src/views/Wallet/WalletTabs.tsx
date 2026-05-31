import { type JSX, useState, useEffect } from 'react'
import { ActivityItem, type ActivityData } from './ActivityItem'
import { getTransactions } from '@/services/transactionService'
import { KNOWN_TOKENS, getTokenBalance } from '@/services/tokenService'
import { fetchBalance } from '@/services/rpcClient'

type WalletTab = 'activity' | 'tokens' | 'nfts'

const WALLET_TABS: Array<{ id: WalletTab; label: string }> = [
  { id: 'activity', label: 'Activity' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'nfts', label: 'NFTs' }
]


interface WalletTabsProps {
  activeWalletAddress: string | null
  activeTab: WalletTab
  onTabChange: (tab: WalletTab) => void
}

/**
 * Tabbed content area for the wallet view, switching between transaction
 * activity, ERC-20 tokens, and NFTs. All sections currently render empty states
 * pending indexer integration.
 * @param props - The active tab and the tab change handler.
 * @returns The rendered tabbed content area.
 */
function WalletTabs({ activeWalletAddress, activeTab, onTabChange }: WalletTabsProps): JSX.Element {
  const [transactions, setTransactions] = useState<ActivityData[]>([])
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})
  
  useEffect(() => {
    if (activeTab === 'activity' && activeWalletAddress) {
      getTransactions(activeWalletAddress).then(setTransactions)
    } else if (activeTab === 'tokens' && activeWalletAddress) {
      const fetchTokens = async (): Promise<void> => {
        const balances: Record<string, string> = {}
        for (const token of KNOWN_TOKENS) {
          if (token.address === 'native') {
            const bal = await fetchBalance(activeWalletAddress)
            balances[token.symbol] = bal || '0.00'
          } else {
            balances[token.symbol] = await getTokenBalance(activeWalletAddress, token.address)
          }
        }
        setTokenBalances(balances)
      }
      fetchTokens()
    }
  }, [activeTab, activeWalletAddress])
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-slate-100/50">
          {WALLET_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
      </div>

      {activeTab === 'activity' && (
        <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {transactions.length > 0 ? (
            transactions.map((tx) => <ActivityItem key={tx.id} activity={tx} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="text-slate-300 mb-3"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <p className="text-sm font-medium text-slate-400">No activity yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Transactions will appear here once you send or receive CMU
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Token
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Price
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Balance
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {KNOWN_TOKENS.filter((token) => Number(tokenBalances[token.symbol]) > 0).map((token) => {
                return (
                  <tr key={token.symbol} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${token.colorClass}`}>
                          {token.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{token.name}</p>
                          <p className="text-xs font-semibold text-slate-400">{token.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-semibold text-slate-700 font-mono">N/A</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-semibold text-slate-700 font-mono">
                        {tokenBalances[token.symbol]}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-slate-800 font-mono">N/A</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'nfts' && (
        <div className="rounded-2xl bg-white border border-slate-200">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-slate-400">No NFTs found</p>
          </div>
        </div>
      )}
    </div>
  )
}

export { WalletTabs }
export type { WalletTabsProps, WalletTab }
