import { type JSX } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { type DerivedAccount } from '@/services'
import { IconCheck, IconCopy } from '@/assets/icons'

interface ReceiveModalProps {
  activeAccount: DerivedAccount | undefined
  copied: boolean
  onCopy: () => void
}

/**
 * Receive modal presenting the active account address as a QR code and a
 * copyable text string for receiving funds.
 * @param props - The active account, the copy flag, and the copy handler.
 * @returns The rendered receive modal body.
 */
function ReceiveModal({ activeAccount, copied, onCopy }: ReceiveModalProps): JSX.Element {
  return (
    <div className="p-8 text-center">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Receive CMU</h3>
      <p className="text-sm text-slate-500 mb-8">
        Scan this QR code or copy the address below to receive funds.
      </p>

      <div className="mx-auto w-56 h-56 bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm mb-8 flex items-center justify-center">
        {activeAccount?.address && (
          <QRCodeSVG value={activeAccount.address} className="w-full h-full" />
        )}
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Your Address
        </p>
        <p className="text-sm font-mono text-slate-800 break-all">{activeAccount?.address}</p>
      </div>

      <button
        onClick={onCopy}
        className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <IconCheck width={16} height={16} strokeWidth={2.5} />
        ) : (
          <IconCopy width={16} height={16} strokeWidth={2.5} />
        )}
        {copied ? 'Address Copied!' : 'Copy Address'}
      </button>
    </div>
  )
}

export { ReceiveModal }
export type { ReceiveModalProps }
