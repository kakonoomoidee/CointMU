import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { type DerivedAccount } from "@/features/wallet";
import { Eye } from "lucide-react";

interface ManageHiddenModalProps {
  accounts: DerivedAccount[];
  onUnhideAccount: (address: string) => void;
}

/**
 * Manage hidden accounts modal listing every hidden account and offering a
 * control to restore each one to the active sidebar.
 * @param props - All accounts and the unhide handler.
 * @returns The rendered manage hidden accounts modal body.
 */
function ManageHiddenModal({
  accounts,
  onUnhideAccount,
}: ManageHiddenModalProps): JSX.Element {
  const hiddenAccounts = accounts.filter((a) => a.isHidden);
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">
        {t("wallet.modals.manageHidden.title")}
      </h3>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">
        {t("wallet.modals.manageHidden.subtitle")}
      </p>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {hiddenAccounts.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-gray-500 text-center py-8">
            {t("wallet.modals.manageHidden.noHidden")}
          </p>
        ) : (
          hiddenAccounts.map((acc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-sm font-bold text-slate-800 dark:text-gray-100 truncate">
                  {acc.label}
                </p>
                <p className="text-xs font-mono text-slate-500 dark:text-gray-400 truncate">
                  {acc.address}
                </p>
              </div>
              <button
                onClick={() => onUnhideAccount(acc.address)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-500 dark:text-gray-400 hover:text-accent dark:hover:text-accent hover:border-accent/30 dark:hover:border-accent/30 hover:bg-accent/10 dark:hover:bg-accent/10 transition-all flex items-center justify-center shadow-sm"
                title={t("wallet.modals.manageHidden.unhideTooltip")}
              >
                <Eye width={14} height={14} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { ManageHiddenModal };
export type { ManageHiddenModalProps };
