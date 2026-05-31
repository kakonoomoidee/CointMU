import { type JSX } from 'react'
import { hexToAscii, formatTxAge } from '@/utils'
import { AddressBadge } from './AddressBadge'

interface BlockDetailProps {
  block: any
  onBack: () => void
  onBlockSelect: (blockNumber: number) => void
  onTransactionSelect: (tx: any) => void
}

/**
 * Detailed block view presenting the block overview, reward, surrounding chain
 * position, and the list of transactions contained in the block.
 * @param props - The selected block and the navigation and selection handlers.
 * @returns The rendered block detail view.
 */
function BlockDetail({
  block,
  onBack,
  onBlockSelect,
  onTransactionSelect
}: BlockDetailProps): JSX.Element {
  const blockNumber = parseInt(block.number, 16)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">
          Block
        </p>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight font-mono">{blockNumber}</h2>
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-5">Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Block Height:</span>
              <span className="text-sm font-mono text-slate-800 text-right">{blockNumber}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Status:</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Finalized
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Timestamp:</span>
              <span className="text-sm text-slate-800 text-right">
                {new Date(parseInt(block.timestamp, 16) * 1000).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Hash:</span>
              <span className="text-sm font-mono text-slate-800 text-right">{block.hash}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Parent Hash:</span>
              <span className="text-sm font-mono text-slate-800 text-right break-all">
                {block.parentHash}
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Miner:</span>
              <AddressBadge address={block.miner} />
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Nonce:</span>
              <span className="text-sm font-mono text-slate-800 text-right">
                {parseInt(block.nonce, 16).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Difficulty:</span>
              <span className="text-sm font-mono text-slate-800 text-right">
                {parseInt(block.difficulty, 16).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Block Size:</span>
              <span className="text-sm font-mono text-slate-800 text-right">
                {parseInt(block.size, 16).toLocaleString()} bytes
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">Transactions:</span>
              <span className="text-sm font-mono text-slate-800 text-right">
                {block.transactions?.length || 0} transactions
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/3">
                Gas Used / Gas Limit:
              </span>
              <span className="text-sm font-mono text-slate-800 text-right">
                {parseInt(block.gasUsed, 16).toLocaleString()} /{' '}
                {parseInt(block.gasLimit, 16).toLocaleString()}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 w-1/3 pt-1">Extra Data:</span>
              <div className="text-right flex-1">
                <p className="text-sm font-mono text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {block.extraData}
                </p>
                <p className="text-[10px] text-slate-500 mt-2 italic font-mono px-1">
                  Ascii: {hexToAscii(block.extraData) || 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Block Reward</h3>
            <p className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
              +10.00 <span className="text-sm font-medium text-slate-400">CMU</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">
              Chain Position
            </h3>
            <div className="flex flex-col gap-3">
              {[
                blockNumber - 3,
                blockNumber - 2,
                blockNumber - 1,
                blockNumber,
                blockNumber + 1
              ].map((num) => {
                if (num < 0) return null
                const isCurrent = num === blockNumber
                return (
                  <div
                    key={num}
                    className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-blue-50 border border-blue-100' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      </svg>
                    </div>
                    <span
                      className={`text-sm font-mono font-bold cursor-pointer hover:underline ${isCurrent ? 'text-blue-700' : 'text-slate-500'}`}
                      onClick={() => onBlockSelect(num)}
                    >
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
        <p className="text-[10px] text-slate-400 mb-5">
          {block.transactions?.length || 0} entries
        </p>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                Hash
              </th>
              <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                From
              </th>
              <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400">
                To
              </th>
              <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">
                Amount
              </th>
              <th className="px-2 py-3 text-[9px] font-semibold tracking-wider uppercase text-slate-400 text-right">
                Age
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {block.transactions && block.transactions.length > 0 ? (
              block.transactions.map((tx: any) => (
                <tr key={tx.hash} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-2 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <span
                        className="text-xs font-mono text-blue-600 cursor-pointer hover:underline"
                        onClick={() => onTransactionSelect(tx)}
                      >
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
                      {formatTxAge(parseInt(block.timestamp, 16))}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-2 py-12 text-center">
                  <p className="text-sm font-medium text-slate-400">
                    No transactions found in this block
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { BlockDetail }
export type { BlockDetailProps }
