import { type JSX } from 'react'
import { IconChevronLeft, IconCheck } from '@/assets/icons'
import { AddressBadge } from './AddressBadge'

interface TransactionDetailProps {
  tx: any
  onBack: () => void
  onBlockSelect: (blockNumber: number) => void
}

/**
 * Detailed transaction view presenting the hash, status, containing block,
 * participants, value, gas accounting, nonce, and input data.
 * @param props - The selected transaction and the navigation handlers.
 * @returns The rendered transaction detail view.
 */
function TransactionDetail({ tx, onBack, onBlockSelect }: TransactionDetailProps): JSX.Element {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <IconChevronLeft width={12} height={12} strokeWidth={2.5} />
          Back
        </button>

        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-0.5">
            Transaction
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight font-mono">{tx.hash}</h2>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
              <IconCheck width={10} height={10} strokeWidth={3} />
              Success
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Transaction hash:</span>
            <span className="text-sm font-mono text-slate-800">{tx.hash}</span>
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Status:</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
              <IconCheck width={10} height={10} strokeWidth={3} />
              Confirmed
            </span>
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Block:</span>
            <span
              className="text-sm font-mono text-blue-600 cursor-pointer hover:underline"
              onClick={() => onBlockSelect(parseInt(tx.blockNumber, 16))}
            >
              #{parseInt(tx.blockNumber, 16)}
            </span>
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">From:</span>
            <AddressBadge address={tx.from} leftAligned />
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">To:</span>
            <AddressBadge address={tx.to} leftAligned />
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Value:</span>
            <span className="text-sm font-bold text-slate-800">
              {(parseInt(tx.value, 16) / 1e18).toFixed(4)} CMU
            </span>
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Gas price:</span>
            <span className="text-sm text-slate-800">{parseInt(tx.gasPrice, 16) / 1e9} gwei</span>
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Gas used:</span>
            <span className="text-sm text-slate-800">{parseInt(tx.gas, 16).toLocaleString()}</span>
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Transaction fee:</span>
            <span className="text-sm text-slate-800">
              {((parseInt(tx.gas, 16) * parseInt(tx.gasPrice, 16)) / 1e18).toFixed(6)} CMU
            </span>
          </div>
          <div className="flex items-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 w-1/4">Nonce:</span>
            <span className="text-sm text-slate-800">{parseInt(tx.nonce, 16)}</span>
          </div>
          <div className="flex items-start">
            <span className="text-xs font-semibold text-slate-500 w-1/4 pt-1">Input data:</span>
            <div className="flex-1">
              <p className="text-sm font-mono text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                {tx.input}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TransactionDetail }
export type { TransactionDetailProps }
