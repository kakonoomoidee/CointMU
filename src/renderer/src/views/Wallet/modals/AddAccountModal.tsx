import { type JSX } from 'react'
import { useWalletUiStore } from '@/store'
import { IconDownload, IconLock } from '@/assets/icons'

interface AddAccountModalProps {
  onImport: () => void
}

/**
 * Add account modal allowing the user to import an account from a seed phrase or
 * a raw private key. The selection, input, and error state are read from and
 * written to the wallet UI store.
 * @param props - The import handler invoked to derive and persist the account.
 * @returns The rendered add account modal body.
 */
function AddAccountModal({ onImport }: AddAccountModalProps): JSX.Element {
  const addAccountType = useWalletUiStore((s) => s.addAccountType)
  const importInput = useWalletUiStore((s) => s.importInput)
  const addAccountError = useWalletUiStore((s) => s.addAccountError)
  const setAddAccountType = useWalletUiStore((s) => s.setAddAccountType)
  const setImportInput = useWalletUiStore((s) => s.setImportInput)

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Add Account</h3>
      <p className="text-sm text-slate-500 mb-8">Import an existing seed phrase or private key.</p>

      {addAccountType === 'SELECT' && (
        <div className="space-y-3">
          <button
            onClick={() => setAddAccountType('IMPORT_SEED')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <IconDownload width={20} height={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Import Seed Phrase</p>
              <p className="text-xs text-slate-500">Restore an account from a 12-word seed.</p>
            </div>
          </button>
          <button
            onClick={() => setAddAccountType('IMPORT_PK')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center flex-shrink-0">
              <IconLock width={20} height={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Import Private Key</p>
              <p className="text-xs text-slate-500">Import a standalone hex private key.</p>
            </div>
          </button>
        </div>
      )}

      {(addAccountType === 'IMPORT_SEED' || addAccountType === 'IMPORT_PK') && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {addAccountType === 'IMPORT_SEED' ? '12-Word Seed Phrase' : 'Private Key (Hex)'}
            </label>
            <textarea
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder={addAccountType === 'IMPORT_SEED' ? 'word1 word2...' : '0x...'}
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm resize-none"
            />
          </div>

          {addAccountError && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
              {addAccountError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setAddAccountType('SELECT')}
              className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onImport}
              className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
            >
              Import
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { AddAccountModal }
export type { AddAccountModalProps }
