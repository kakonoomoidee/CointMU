import { useState, useRef, useEffect, type JSX } from 'react'
import { type DerivedAccount } from '@/services'

interface SidebarProps {
  accounts: DerivedAccount[]
  activeWalletAddress: string | null
  balance: string
  peerCount: number | null
  activeView: string
  setActiveView: (view: string) => void
  onLogout: () => void
}

const APP_VERSION = 'v0.4.2'
const APP_NETWORK = 'testnet'

/**
 * Sidebar navigation component with workspace routing and a popover-enabled
 * user profile section for locking the wallet.
 * @param props The properties to configure and control the sidebar state.
 * @returns The Sidebar component.
 */
export function Sidebar({
  accounts,
  activeWalletAddress,
  balance,
  peerCount,
  activeView,
  setActiveView,
  onLogout
}: SidebarProps): JSX.Element {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const activeAccount = accounts.find(a => a.address === activeWalletAddress) || accounts[0]
  const abbrAddress = activeWalletAddress 
    ? `${activeWalletAddress.substring(0, 6)}...${activeWalletAddress.substring(activeWalletAddress.length - 4)}`
    : '--'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <aside className="w-56 flex flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm shadow-blue-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">CointMU</p>
          <p className="text-[10px] text-slate-400 tracking-wide">{APP_VERSION} - {APP_NETWORK}</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-600">
            Connected to
            <span className="font-semibold text-blue-600 ml-1">CointMU Mainnet</span>
          </span>
          <span className="ml-auto text-[10px] font-bold text-slate-500">
            {peerCount !== null ? peerCount : '--'}
          </span>
          <span className="text-[10px] text-slate-400">peers</span>
        </div>
      </div>

      <div className="px-4 pt-5 pb-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400 px-2">
          Workspace
        </p>
      </div>
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
            activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </button>

        <button
          onClick={() => setActiveView('miner')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
            activeView === 'miner' ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            <rect x="9" y="9" width="6" height="6" />
            <line x1="9" y1="1" x2="9" y2="4" />
            <line x1="15" y1="1" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="23" />
            <line x1="15" y1="20" x2="15" y2="23" />
            <line x1="20" y1="9" x2="23" y2="9" />
            <line x1="20" y1="14" x2="23" y2="14" />
            <line x1="1" y1="9" x2="4" y2="9" />
            <line x1="1" y1="14" x2="4" y2="14" />
          </svg>
          Mining
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        <button
          onClick={() => setActiveView('wallet')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
            activeView === 'wallet' ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M22 10H2" />
          </svg>
          Wallet
        </button>

        <button
          onClick={() => setActiveView('explorer')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
            activeView === 'explorer' ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Explorer
        </button>

        <div className="pt-4 pb-1 px-2">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">
            System
          </p>
        </div>

        <button
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
            activeView === 'settings' ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Settings
        </button>
      </nav>

      <div className="relative px-4 py-3 border-t border-slate-100" ref={popoverRef}>
        {isPopoverOpen && (
          <div className="absolute bottom-full mb-2 left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-bottom">
            <button
              onClick={() => {
                setIsPopoverOpen(false)
                setActiveView('settings')
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <svg className="text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span className="text-xs font-semibold text-slate-700">Settings</span>
            </button>
            <div className="h-px bg-slate-100 my-1 mx-2" />
            <button
              onClick={() => {
                setIsPopoverOpen(false)
                onLogout()
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left group"
            >
              <svg className="text-red-400 group-hover:text-red-500 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0" />
              </svg>
              <span className="text-xs font-semibold text-red-600">Lock Wallet</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <svg
              className="text-slate-500"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M22 10H2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700 truncate">{activeAccount?.label || 'Wallet'}</p>
              <p className="text-xs font-bold text-slate-800 ml-2">{balance}</p>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[10px] text-slate-400 font-mono" title={activeWalletAddress || undefined}>
                {abbrAddress}
              </p>
              <p className="text-[10px] text-slate-400">CMU</p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  )
}
