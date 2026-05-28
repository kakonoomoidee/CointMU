import { useState, type JSX } from 'react'
import { Dashboard, Miner } from '@/views'
import { useRpcPort } from '@/hooks'

const NAV_ITEM_DASHBOARD = 'dashboard'
const NAV_ITEM_MINER = 'miner'

type ActiveView = typeof NAV_ITEM_DASHBOARD | typeof NAV_ITEM_MINER

/**
 * Root application component rendering a sidebar navigation layout
 * with view routing between Dashboard and Miner panels.
 * @returns The top-level application shell with sidebar and content area.
 */
function App(): JSX.Element {
  const [activeView, setActiveView] = useState<ActiveView>(NAV_ITEM_DASHBOARD)
  const { port } = useRpcPort()

  return (
    <div className="flex h-full bg-[var(--color-surface-primary)]">
      <aside className="w-56 flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)]">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold gradient-text">CointMU</p>
            <p className="text-[10px] text-[var(--color-text-muted)] tracking-wide">Desktop Client</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          <button
            id="nav-dashboard"
            onClick={() => setActiveView(NAV_ITEM_DASHBOARD)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 ease-out text-left
              ${activeView === NAV_ITEM_DASHBOARD
                ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/20'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] border border-transparent'
              }
            `}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </button>

          <button
            id="nav-miner"
            onClick={() => setActiveView(NAV_ITEM_MINER)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 ease-out text-left
              ${activeView === NAV_ITEM_MINER
                ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-glow)] border border-[var(--color-accent-primary)]/20'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] border border-transparent'
              }
            `}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            Miner
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-[var(--color-border-subtle)]">
          <p className="text-[10px] text-[var(--color-text-muted)]">CointMU Desktop v1.0.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        {activeView === NAV_ITEM_DASHBOARD && <Dashboard />}
        {activeView === NAV_ITEM_MINER && (
          <div className="h-full flex flex-col">
            <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border-subtle)]">
              <h1 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                Mining Controller
              </h1>
            </header>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <Miner port={port} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
