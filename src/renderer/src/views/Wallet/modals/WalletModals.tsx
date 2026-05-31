import { type JSX } from 'react'
import { type DerivedAccount } from '@/services'
import { useWalletUiStore } from '@/store'
import { IconX } from '@/assets/icons'
import { ReceiveModal } from './ReceiveModal'
import { SendModal } from './SendModal'
import { AddAccountModal } from './AddAccountModal'
import { ManageHiddenModal } from './ManageHiddenModal'

interface WalletModalsProps {
  accounts: DerivedAccount[]
  activeAccount: DerivedAccount | undefined
  copied: boolean
  gasEstFormatted: string
  totalDeducted: string
  onClose: () => void
  onCopy: () => void
  onSend: () => void
  onImportAccount: () => void
  onUnhideAccount: (address: string) => void
}

/**
 * Modal host for the wallet view. It renders the shared overlay and close
 * control, then dispatches to the active modal body based on the wallet UI store
 * modal state.
 * @param props - Account data, derived fee strings, and the modal action handlers.
 * @returns The rendered modal overlay, or null when no modal is open.
 */
function WalletModals({
  accounts,
  activeAccount,
  copied,
  gasEstFormatted,
  totalDeducted,
  onClose,
  onCopy,
  onSend,
  onImportAccount,
  onUnhideAccount
}: WalletModalsProps): JSX.Element | null {
  const modalState = useWalletUiStore((s) => s.modalState)

  if (modalState === 'NONE') {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <IconX width={20} height={20} strokeWidth={2.5} />
        </button>

        {modalState === 'RECEIVE' && (
          <ReceiveModal activeAccount={activeAccount} copied={copied} onCopy={onCopy} />
        )}

        {modalState === 'SEND' && (
          <SendModal
            gasEstFormatted={gasEstFormatted}
            totalDeducted={totalDeducted}
            onSend={onSend}
            onDone={onClose}
          />
        )}

        {modalState === 'ADD_ACCOUNT' && <AddAccountModal onImport={onImportAccount} />}

        {modalState === 'MANAGE_HIDDEN' && (
          <ManageHiddenModal accounts={accounts} onUnhideAccount={onUnhideAccount} />
        )}
      </div>
    </div>
  )
}

export { WalletModals }
export type { WalletModalsProps }
