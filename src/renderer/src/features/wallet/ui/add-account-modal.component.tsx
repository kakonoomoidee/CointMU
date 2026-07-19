import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useWalletUiStore } from "../model/wallet-ui.store";
import { Download, Lock, FileText } from "lucide-react";

interface AddAccountModalProps {
  onImport: () => void;
  onImportKeystore: () => void;
}

/**
 * Add account modal allowing the user to import an account from a seed phrase or
 * a raw private key. The selection, input, and error state are read from and
 * written to the wallet UI store.
 * @param props - The import handler invoked to derive and persist the account.
 * @returns The rendered add account modal body.
 */
function AddAccountModal({
  onImport,
  onImportKeystore,
}: AddAccountModalProps): JSX.Element {
  const addAccountType = useWalletUiStore((s) => s.addAccountType);
  const importInput = useWalletUiStore((s) => s.importInput);
  const addAccountError = useWalletUiStore((s) => s.addAccountError);
  const setAddAccountType = useWalletUiStore((s) => s.setAddAccountType);
  const setImportInput = useWalletUiStore((s) => s.setImportInput);
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">
        {t("wallet:modals.addAccount.title")}
      </h3>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">
        {t("wallet:modals.addAccount.subtitle")}
      </p>

      {addAccountType === "SELECT" && (
        <div className="space-y-3">
          <button
            onClick={() => setAddAccountType("IMPORT_SEED")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-gray-700/50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <Download width={20} height={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-gray-100">
                {t("wallet:modals.addAccount.importSeedTitle")}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {t("wallet:modals.addAccount.importSeedSubtitle")}
              </p>
            </div>
          </button>
          <button
            onClick={() => setAddAccountType("IMPORT_PK")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-gray-700/50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center flex-shrink-0">
              <Lock width={20} height={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-gray-100">
                {t("wallet:modals.addAccount.importPkTitle")}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {t("wallet:modals.addAccount.importPkSubtitle")}
              </p>
            </div>
          </button>
          <button
            onClick={onImportKeystore}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-gray-700 dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
              <FileText width={20} height={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-gray-100">
                {t("wallet:modals.addAccount.importJsonTitle")}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {t("wallet:modals.addAccount.importJsonSubtitle")}
              </p>
            </div>
          </button>
        </div>
      )}

      {(addAccountType === "IMPORT_SEED" || addAccountType === "IMPORT_PK") && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-200 mb-2">
              {addAccountType === "IMPORT_SEED"
                ? t("wallet:modals.addAccount.seedLabel")
                : t("wallet:modals.addAccount.pkLabel")}
            </label>
            <textarea
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder={
                addAccountType === "IMPORT_SEED"
                  ? t("wallet:modals.addAccount.seedPlaceholder")
                  : t("wallet:modals.addAccount.pkPlaceholder")
              }
              rows={3}
              className="w-full p-4 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 transition-all font-mono text-sm resize-none"
            />
          </div>

          {addAccountError && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
              {addAccountError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setAddAccountType("SELECT")}
              className="flex-1 py-3.5 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
            >
              {t("wallet:modals.addAccount.back")}
            </button>
            <button
              onClick={onImport}
              className="flex-1 py-3.5 bg-accent text-white font-bold rounded-xl shadow-sm shadow-accent/20 hover:opacity-90 transition-opacity"
            >
              {t("wallet:modals.addAccount.importBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { AddAccountModal };
export type { AddAccountModalProps };
