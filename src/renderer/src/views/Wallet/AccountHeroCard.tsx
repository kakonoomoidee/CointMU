import { type JSX } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { type DerivedAccount } from '@/services'
import { IconArrowUp, IconArrowDown, IconRefresh, IconCheck, IconCopy } from '@/assets/icons'

interface AccountHeroCardProps {
  activeAccount: DerivedAccount | undefined
  activeGradient: string
  balance: string
  copied: boolean
  onReceive: () => void
  onSend: () => void
  onCopy: () => void
}

/**
 * Hero card for the selected account showing its identity, QR code, node-reported
 * balance, and the primary send, receive, swap, and copy actions.
 * @param props - The active account, gradient, balance, copy flag, and handlers.
 * @returns The rendered account hero card.
 */
function AccountHeroCard({
  activeAccount,
  activeGradient,
  balance,
  copied,
  onReceive,
  onSend,
  onCopy
}: AccountHeroCardProps): JSX.Element {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 p-7 text-white relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/3 blur-sm" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeGradient}`} />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{activeAccount?.label}</p>
                <span className="text-[9px] font-semibold tracking-wider uppercase text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                  EOA
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">{activeAccount?.address}</p>
            </div>
          </div>

          <div
            className="w-20 h-20 rounded-lg bg-white p-1.5 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onReceive}
          >
            {activeAccount?.address ? (
              <QRCodeSVG value={activeAccount.address} className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:6px_6px] rounded-sm" />
            )}
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-bold tracking-tight">{balance}</span>
            <span className="text-lg font-semibold text-white/60">CMU</span>
          </div>
          <p className="text-sm text-white/40 mt-1">Balance from node</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSend}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <IconArrowUp width={12} height={12} strokeWidth={2.5} />
            Send
          </button>
          <button
            onClick={onReceive}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <IconArrowDown width={12} height={12} strokeWidth={2.5} />
            Receive
          </button>
          <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
            <IconRefresh width={12} height={12} />
            Swap
          </button>
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            {copied ? (
              <IconCheck width={12} height={12} />
            ) : (
              <IconCopy width={12} height={12} />
            )}
            {copied ? 'Copied!' : 'Copy address'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { AccountHeroCard }
export type { AccountHeroCardProps }
