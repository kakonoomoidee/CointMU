import { type JSX } from 'react'
import { type DerivedAccount } from '@/services'
import { IconEye } from '@/assets/icons'

interface ManageHiddenModalProps {
  accounts: DerivedAccount[]
  onUnhideAccount: (address: string) => void
}

/**
 * Manage hidden accounts modal listing every hidden account and offering a
 * control to restore each one to the active sidebar.
 * @param props - All accounts and the unhide handler.
 * @returns The rendered manage hidden accounts modal body.
 */
function ManageHiddenModal({ accounts, onUnhideAccount }: ManageHiddenModalProps): JSX.Element {
  const hiddenAccounts = accounts.filter((a) => a.isHidden)

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Hidden Accounts</h3>
      <p className="text-sm text-slate-500 mb-8">Restore accounts to your active sidebar.</p>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {hiddenAccounts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No hidden accounts.</p>
        ) : (
          hiddenAccounts.map((acc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-sm font-bold text-slate-800 truncate">{acc.label}</p>
                <p className="text-xs font-mono text-slate-500 truncate">{acc.address}</p>
              </div>
              <button
                onClick={() => onUnhideAccount(acc.address)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm"
                title="Unhide account"
              >
                <IconEye width={14} height={14} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export { ManageHiddenModal }
export type { ManageHiddenModalProps }
