import { type JSX } from 'react'
import { type BlockData } from '@/hooks'
import { IconActivity } from '@/assets/icons'
import { formatTxAge } from '@/utils'

type TabState = 'blocks' | 'transactions' | 'accounts'

interface TopAccount {
  address: string
  balance: number
}

interface ExplorerDataTabsProps {
  activeTab: TabState
  onTabChange: (tab: TabState) => void
  isConnected: boolean
  recentBlocks: BlockData[]
  topAccounts: TopAccount[]
  isLoadingAccounts: boolean
  activeWalletAddress: string | null
  onBlockSelect: (blockNumber: number) => void
}

const TRANSACTIONS: never[] = []
const MINER_DISTRIBUTION: never[] = []

/**
 * Explorer main data area combining the tab switcher, the live block,
 * transaction, and top-account tables, and the miner distribution panel.
 * @param props - The active tab, connection state, data sets, and handlers.
 * @returns The rendered data tabs and distribution panel.
 */
function ExplorerDataTabs({
  activeTab,
  onTabChange,
  isConnected,
  recentBlocks,
  topAccounts,
  isLoadingAccounts,
  activeWalletAddress,
  onBlockSelect
}: ExplorerDataTabsProps): JSX.Element {
  return (
    <div className="flex gap-6">
      <div className="flex-[2] min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('blocks')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'blocks' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Latest blocks
            </button>
            <button
              onClick={() => onTabChange('transactions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'transactions' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Transactions
            </button>
            <button
              onClick={() => onTabChange('accounts')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'accounts' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Top accounts
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-400">Auto-refresh</span>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded ${isConnected ? 'bg-emerald-50' : 'bg-slate-100'}`}
            >
              {isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <span
                className={`text-[9px] font-bold uppercase ${isConnected ? 'text-emerald-600' : 'text-slate-500'}`}
              >
                {isConnected ? 'Live' : 'Off'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'blocks' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    Block
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    Miner / Hash
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    Txs
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    Reward
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">
                    Age
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBlocks.length > 0 ? (
                  recentBlocks.map((block) => (
                    <tr key={block.hash} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p
                          className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline"
                          onClick={() => onBlockSelect(block.number)}
                        >
                          #{block.number}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-mono text-slate-800">
                          {block.miner.substring(0, 10)}...
                          {block.miner.substring(block.miner.length - 8)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Hash: {block.hash.substring(0, 14)}...
                        </p>
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
                        <p className="text-[10px] text-slate-500">{formatTxAge(block.timestamp)}</p>
                      </td>
                    </tr>
                  ))
                ) : (
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
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    Hash
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    From
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    To
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">
                    Age
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TRANSACTIONS.length > 0 ? (
                  TRANSACTIONS.map((_, i) => (
                    <tr key={i}>
                      <td />
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Transaction data requires an indexer
                      </p>
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
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    #
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    Address
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                    Tag
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">
                    Balance
                  </th>
                  <th className="px-5 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">
                    % Supply
                  </th>
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
                ) : topAccounts.length > 0 ? (
                  topAccounts.map((acc, i) => (
                    <tr key={acc.address} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-slate-500">{i + 1}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-slate-200 flex-shrink-0" />
                          <p className="text-xs font-mono text-blue-600">
                            {acc.address.substring(0, 10)}...
                            {acc.address.substring(acc.address.length - 8)}
                          </p>
                          {acc.address.toLowerCase() === activeWalletAddress?.toLowerCase() && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-medium text-slate-500">
                          Miner
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <p className="text-xs font-bold text-slate-800">
                            {acc.balance.toLocaleString(undefined, {
                              minimumFractionDigits: acc.balance % 1 === 0 ? 1 : 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <span className="text-[9px] font-semibold text-slate-400">CMU</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="text-[10px] text-slate-500">-- %</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Account data requires an indexer or active network
                      </p>
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
        <p className="text-[10px] text-slate-400 mt-0.5 mb-5">
          Share of blocks mined - past 24 hours
        </p>

        <div className="space-y-4">
          {MINER_DISTRIBUTION.length > 0 ? (
            MINER_DISTRIBUTION.map((_, i) => <div key={i} />)
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <IconActivity className="text-slate-300 mb-2" width={28} height={28} strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-400">Awaiting network activity</p>
              <p className="text-xs text-slate-400 mt-0.5">Distribution requires an indexer</p>
            </div>
          )}
        </div>

        <div className="mt-5 h-2 flex rounded-full overflow-hidden gap-0.5">
          {MINER_DISTRIBUTION.length > 0 ? (
            MINER_DISTRIBUTION.map((_, i) => <div key={i} className="h-full bg-slate-200" />)
          ) : (
            <div className="h-full w-full bg-slate-100" />
          )}
        </div>
      </div>
    </div>
  )
}

export { ExplorerDataTabs }
export type { ExplorerDataTabsProps, TabState }
