import { type JSX, type MouseEvent } from 'react'
import { generateIdenticonGradient, type DerivedAccount } from '@/services'
import { IconPlus, IconEyeSlash } from '@/assets/icons'

const WATCH_LIST: never[] = []

interface AccountSidebarProps {
  accounts: DerivedAccount[]
  activeWalletAddress: string | null
  balances: Record<string, string>
  onAccountSwitch: (address: string) => void
  onHideAccount: (event: MouseEvent, address: string) => void
  onDeriveAccount: () => void
  onImportWallet: () => void
  onManageHidden: () => void
}

/**
 * Wallet accounts sidebar listing visible accounts with balances, the watch
 * list placeholder, and entry points for deriving, importing, and managing
 * hidden accounts.
 * @param props - Account data, the active address, balance, and action handlers.
 * @returns The rendered account sidebar.
 */
function AccountSidebar({
  accounts,
  activeWalletAddress,
  balances,
  onAccountSwitch,
  onHideAccount,
  onDeriveAccount,
  onImportWallet,
  onManageHidden
}: AccountSidebarProps): JSX.Element {
  return (
    <div className="w-64 flex-shrink-0 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">
            Accounts
          </h3>
          <button
            onClick={onDeriveAccount}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconPlus width={14} height={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-1">
          {accounts
            .filter((a) => !a.isHidden)
            .map((acc, i) => {
              const gradient = generateIdenticonGradient(acc.address)
              const abbrAddress = `${acc.address.substring(0, 6)}...${acc.address.substring(acc.address.length - 4)}`
              const isSelected = acc.address === activeWalletAddress

              return (
                <button
                  key={i}
                  onClick={() => onAccountSwitch(acc.address)}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-white border border-slate-200 shadow-sm'
                      : 'hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700 truncate">{acc.label}</p>
                      <p className="text-xs font-bold text-slate-800 ml-2 group-hover:opacity-0 transition-opacity">
                        {balances[acc.address] || '0.00'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p
                        className="text-[10px] text-slate-400 font-mono truncate"
                        title={acc.address}
                      >
                        {abbrAddress}
                      </p>
                      <p className="text-[10px] text-slate-400 group-hover:opacity-0 transition-opacity">
                        CMU
                      </p>
                    </div>
                  </div>

                  {!isSelected && (
                    <div
                      onClick={(e) => onHideAccount(e, acc.address)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
                      title="Hide account"
                    >
                      <IconEyeSlash width={14} height={14} strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              )
            })}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">
          Watch List
        </h3>
        <div className="space-y-2">
          {WATCH_LIST.length > 0 ? (
            WATCH_LIST.map((_, i) => <div key={i} />)
          ) : (
            <p className="text-xs text-slate-400 px-3 py-2">No watched addresses</p>
          )}
        </div>
      </div>

      <button
        onClick={onImportWallet}
        className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors py-2"
      >
        + Import wallet
      </button>
      <button
        onClick={onManageHidden}
        className="w-full text-center text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors py-1"
      >
        Manage hidden accounts
      </button>
    </div>
  )
}

export { AccountSidebar }
export type { AccountSidebarProps }
