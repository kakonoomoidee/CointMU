import { type JSX, type SyntheticEvent, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

interface ExplorerSearchProps {
  searchValue: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onSearchValueChange: (value: string) => void;
  onSubmit: (event: SyntheticEvent) => void;
}

/**
 * Explorer search panel providing a single field that accepts a block number,
 * transaction hash, or address, with a keyboard shortcut hint.
 * @param props - The search value, input ref, and the change and submit handlers.
 * @returns The rendered search panel.
 */
function ExplorerSearch({
  searchValue,
  searchInputRef,
  onSearchValueChange,
  onSubmit,
}: ExplorerSearchProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-sm">
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">
        {t("explorer:search.searchChain")}
      </p>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100 tracking-tight mb-5">
        {t("explorer:search.title")}
      </h2>

      <form onSubmit={onSubmit} className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-slate-400" width={20} height={20} />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all dark:text-white"
          placeholder={t("explorer:search.placeholder")}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <kbd className="px-2 py-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded text-[10px] font-mono text-slate-400 dark:text-gray-400 font-bold">
            {t("explorer:search.shortcut")}
          </kbd>
        </div>
      </form>
    </div>
  );
}

export { ExplorerSearch };
export type { ExplorerSearchProps };
