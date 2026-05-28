import { type JSX } from 'react'
import { useMiner } from '@/hooks'
import { formatHashrate } from '@/utils'

interface MinerProps {
  port: number | null
}

/**
 * Mining controller view displaying the current mining status, live hashrate,
 * and an interactive toggle button to start or stop the mining process.
 * @param props - Contains the dynamically resolved RPC port for node communication.
 * @returns The complete miner control panel layout.
 */
function Miner({ port }: MinerProps): JSX.Element {
  const { state, handleStart, handleStop } = useMiner(port)

  const statusLabel = state.mining ? 'Active' : 'Inactive'
  const statusDotClass = state.mining
    ? 'status-dot status-dot-online'
    : 'status-dot status-dot-offline'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-sm font-medium tracking-wider uppercase text-[var(--color-text-muted)] mb-4">
          Mining Controller
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-glass shimmer-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--color-text-muted)] text-xs font-medium tracking-wider uppercase">
              Status
            </span>
            <div className={statusDotClass} />
          </div>
          <p className="text-2xl font-semibold tracking-tight">
            {statusLabel}
          </p>
        </div>

        <div className="card-glass shimmer-border p-5" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--color-text-muted)] text-xs font-medium tracking-wider uppercase">
              Hashrate
            </span>
            <svg
              className="text-[var(--color-accent-primary)] opacity-60"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <p className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-family-mono)]">
            {formatHashrate(state.hashrate)}
          </p>
        </div>

        <div className="card-glass shimmer-border p-5" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--color-text-muted)] text-xs font-medium tracking-wider uppercase">
              Threads
            </span>
            <svg
              className="text-[var(--color-accent-secondary)] opacity-60"
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
          </div>
          <p className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-family-mono)]">
            1
          </p>
        </div>
      </div>

      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Mining Engine
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {state.mining
                ? 'The miner is currently producing hashes on the CointMU network'
                : 'Start the miner to begin producing blocks and earning rewards'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={statusDotClass} />
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {statusLabel}
            </span>
          </div>
        </div>

        {state.error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
            <p className="text-sm text-[var(--color-error)]">
              {state.error}
            </p>
          </div>
        )}

        <button
          id="miner-toggle-button"
          onClick={state.mining ? handleStop : handleStart}
          disabled={state.toggling}
          className={`
            w-full py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wide
            transition-all duration-300 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            ${state.mining
              ? 'bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/25'
              : 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white hover:shadow-lg hover:shadow-[var(--color-accent-primary)]/25'
            }
          `}
        >
          {state.toggling
            ? 'Processing...'
            : state.mining
              ? 'Stop Mining'
              : 'Start Mining'}
        </button>
      </div>

      {state.mining && (
        <div className="card-glass p-6 animate-fade-in-up">
          <h3 className="text-sm font-medium tracking-wider uppercase text-[var(--color-text-muted)] mb-4">
            Live Performance
          </h3>
          <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-[var(--color-border-subtle)]">
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text font-[family-name:var(--font-family-mono)]">
                {formatHashrate(state.hashrate)}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Current mining speed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { Miner }
