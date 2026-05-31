import { type JSX } from 'react'
import { IconPlus } from '@/assets/icons'

interface WalletHeaderProps {
  onAddAccount: () => void
}

/**
 * Wallet view header presenting the workspace breadcrumb, the sync status pill,
 * a backup action, and the new account action.
 * @param props - Handler invoked to open the add-account modal.
 * @returns The rendered wallet header.
 */
function WalletHeader({ onAddAccount }: WalletHeaderProps): JSX.Element {
  return (
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
          onClick={onAddAccount}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <IconPlus width={12} height={12} strokeWidth={3} />
          New account
        </button>
      </div>
    </header>
  )
}

export { WalletHeader }
export type { WalletHeaderProps }
