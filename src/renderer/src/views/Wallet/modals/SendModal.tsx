import { type JSX } from 'react'
import { useWalletUiStore } from '@/store'
import { IconCheck } from '@/assets/icons'

interface SendModalProps {
  gasEstFormatted: string
  totalDeducted: string
  onSend: () => void
  onDone: () => void
}

/**
 * Send modal for transferring CMU to another address. Reads and writes the send
 * form fields directly from the wallet UI store, and surfaces a success state
 * with the broadcast transaction hash once a transfer completes.
 * @param props - Derived fee strings, the send handler, and the done handler.
 * @returns The rendered send modal body.
 */
function SendModal({ gasEstFormatted, totalDeducted, onSend, onDone }: SendModalProps): JSX.Element {
  const sendTo = useWalletUiStore((s) => s.sendTo)
  const sendAmount = useWalletUiStore((s) => s.sendAmount)
  const sendLoading = useWalletUiStore((s) => s.sendLoading)
  const sendError = useWalletUiStore((s) => s.sendError)
  const sendSuccess = useWalletUiStore((s) => s.sendSuccess)
  const setSendTo = useWalletUiStore((s) => s.setSendTo)
  const setSendAmount = useWalletUiStore((s) => s.setSendAmount)

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Send CMU</h3>
      <p className="text-sm text-slate-500 mb-8">Transfer funds to another address.</p>

      {sendSuccess ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck width={32} height={32} strokeWidth={3} />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-2">Transaction Sent!</p>
          <p className="text-sm text-slate-500 mb-4 break-all font-mono">Hash: {sendSuccess}</p>
          <button
            onClick={onDone}
            className="w-full py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">To Address</label>
            <input
              type="text"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              disabled={sendLoading}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                disabled={sendLoading}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-400">CMU</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Network Fee (Est.)</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {gasEstFormatted} CMU
              </span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800">Total Deducted</span>
              <span className="text-sm font-mono font-bold text-slate-800">{totalDeducted} CMU</span>
            </div>
          </div>

          {sendError && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
              {sendError}
            </p>
          )}

          <button
            onClick={onSend}
            disabled={sendLoading}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {sendLoading ? 'Sending & Confirming...' : 'Review & Sign'}
          </button>
        </div>
      )}
    </div>
  )
}

export { SendModal }
export type { SendModalProps }
