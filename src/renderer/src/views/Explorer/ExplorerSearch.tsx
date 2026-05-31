import { type JSX, type FormEvent, type RefObject } from 'react'

interface ExplorerSearchProps {
  searchValue: string
  searchInputRef: RefObject<HTMLInputElement | null>
  onSearchValueChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
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
  onSubmit
}: ExplorerSearchProps): JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className="text-sm text-slate-500 mb-1">Search the chain</p>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-5">
        Block, transaction, or address
      </h2>

      <form onSubmit={onSubmit} className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="text-slate-400"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="0x... address, transaction hash, block number, or username.cmu"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 font-bold">
            Ctrl+K
          </kbd>
        </div>
      </form>
    </div>
  )
}

export { ExplorerSearch }
export type { ExplorerSearchProps }
