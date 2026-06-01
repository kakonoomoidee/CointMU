import { useState, useEffect, type JSX } from 'react'
import { IconChevronLeft, IconCheck, IconAlertCircle } from '@/assets/icons'
import { getTransactionDetail, type TransactionDetailData } from '@/services'
import { useAppStore } from '@/store'
import { AddressBadge } from './AddressBadge'

interface TransactionDetailProps {
  tx: { hash: string }
  onBack: () => void
  onBlockSelect: (blockNumber: number) => void
  onAddressSelect: (address: string) => void
}

const MOCK_USD_RATE = 0.42

/**
 * Detailed transaction view presenting the hash, receipt-derived status and
 * confirmations, containing block, timestamp, participants, value, gas
 * accounting, fee, nonce, and input data. The receipt and block are fetched on
 * mount so status and actual gas used reflect on-chain execution.
 * @param props - The selected transaction hash and the navigation handlers.
 * @returns The rendered transaction detail view.
 */
function TransactionDetail({
  tx,
  onBack,
  onBlockSelect,
  onAddressSelect
}: TransactionDetailProps): JSX.Element {
  const blockHeight = useAppStore((s) => s.blockHeight)
  const [detail, setDetail] = useState<TransactionDetailData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getTransactionDetail(tx.hash).then((result) => {
      if (mounted) {
        setDetail(result)
        setLoading(false)
      }
    })
    return (): void => {
      mounted = false
    }
  }, [tx.hash])

  const confirmations =
    detail && detail.blockNumber !== null && blockHeight !== null
      ? Math.max(0, blockHeight - detail.blockNumber + 1)
      : null

  const isSuccess = detail?.status === 'success'
  const statusLabel =
    detail?.status === 'success'
      ? confirmations !== null
        ? `Confirmed - ${confirmations} confirmations`
        : 'Confirmed'
      : detail?.status === 'failed'
        ? 'Failed'
        : 'Pending'

  const approxUsd =
    detail !== null
      ? (detail.valueCmu * MOCK_USD_RATE).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      : '0.00'

  const gasUsedLabel =
    detail && detail.gasUsed !== null
      ? `${detail.gasUsed.toLocaleString()} / ${detail.gasLimit.toLocaleString()} (${Math.round(
          (detail.gasUsed / detail.gasLimit) * 100
        )}%)`
      : detail
        ? detail.gasLimit.toLocaleString()
        : '--'

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
            {detail && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  isSuccess
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    : 'text-red-600 bg-red-50 border-red-100'
                }`}
              >
                {isSuccess ? (
                  <IconCheck width={10} height={10} strokeWidth={3} />
                ) : (
                  <IconAlertCircle width={10} height={10} />
                )}
                {isSuccess ? 'Success' : detail.status === 'failed' ? 'Failed' : 'Pending'}
              </span>
            )}
          </div>
        </div>
      </div>

      {loading || !detail ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">Loading transaction...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Transaction hash:</span>
              <span className="text-sm font-mono text-slate-800 break-all">{detail.hash}</span>
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Status:</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  isSuccess
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    : 'text-red-600 bg-red-50 border-red-100'
                }`}
              >
                {isSuccess ? (
                  <IconCheck width={10} height={10} strokeWidth={3} />
                ) : (
                  <IconAlertCircle width={10} height={10} />
                )}
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Block:</span>
              {detail.blockNumber !== null ? (
                <span
                  className="text-sm font-mono text-blue-600 cursor-pointer hover:underline"
                  onClick={() => onBlockSelect(detail.blockNumber as number)}
                >
                  #{detail.blockNumber.toLocaleString()}
                </span>
              ) : (
                <span className="text-sm text-slate-400">Pending</span>
              )}
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Timestamp:</span>
              <span className="text-sm text-slate-800">
                {detail.timestamp !== null
                  ? new Date(detail.timestamp * 1000).toLocaleString()
                  : '--'}
              </span>
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">From:</span>
              <AddressBadge address={detail.from} leftAligned onClick={onAddressSelect} />
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">To:</span>
              <AddressBadge address={detail.to} leftAligned onClick={onAddressSelect} />
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Value:</span>
              <span className="text-sm font-bold text-slate-800">
                {detail.valueCmu.toFixed(4)} CMU
                <span className="text-xs font-medium text-slate-400 ml-2">{'≈'} ${approxUsd}</span>
              </span>
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Gas price:</span>
              <span className="text-sm text-slate-800">{detail.gasPriceGwei} gwei</span>
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Gas used:</span>
              <span className="text-sm text-slate-800">{gasUsedLabel}</span>
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Transaction fee:</span>
              <span className="text-sm text-slate-800">
                {detail.feeCmu !== null ? `${detail.feeCmu.toFixed(6)} CMU` : '--'}
              </span>
            </div>
            <div className="flex items-center pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 w-1/4">Nonce:</span>
              <span className="text-sm text-slate-800">{detail.nonce}</span>
            </div>
            <div className="flex items-start">
              <span className="text-xs font-semibold text-slate-500 w-1/4 pt-1">Input data:</span>
              <div className="flex-1">
                {detail.input === '0x' || detail.input === '' ? (
                  <p className="text-sm font-mono text-slate-500 italic">
                    0x - empty (simple value transfer)
                  </p>
                ) : (
                  <p className="text-sm font-mono text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {detail.input}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { TransactionDetail }
export type { TransactionDetailProps }
