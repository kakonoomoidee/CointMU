import type { NetworkStatus as NetworkStatusType } from '@/hooks'
import { formatBlockNumber, formatChainId, formatPeerCount } from '@/utils'
import { type JSX } from 'react'

interface NetworkStatusProps {
  status: NetworkStatusType
}

/**
 * Displays the real-time blockchain network status including block height,
 * chain identity, peer connections, and synchronization state.
 * @param props - Contains the network status data object from the polling hook.
 * @returns A grid of status indicator cards.
 */
function NetworkStatus({ status }: NetworkStatusProps): JSX.Element {
  const syncLabel = status.syncing === false ? 'Synced' : status.syncing ? 'Syncing' : 'Unknown'
  const syncDotClass =
    status.syncing === false
      ? 'status-dot status-dot-online'
      : status.syncing
        ? 'status-dot status-dot-syncing'
        : 'status-dot status-dot-offline'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card-glass shimmer-border p-5 animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[var(--color-text-muted)] text-xs font-medium tracking-wider uppercase">
            Block Height
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
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <p className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-family-mono)]">
          {formatBlockNumber(status.blockNumber)}
        </p>
      </div>

      <div className="card-glass shimmer-border p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[var(--color-text-muted)] text-xs font-medium tracking-wider uppercase">
            Chain ID
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
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <p className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-family-mono)]">
          {formatChainId(status.chainId)}
        </p>
      </div>

      <div className="card-glass shimmer-border p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[var(--color-text-muted)] text-xs font-medium tracking-wider uppercase">
            Peers
          </span>
          <svg
            className="text-[var(--color-success)] opacity-60"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-family-mono)]">
          {formatPeerCount(status.peerCount)}
        </p>
      </div>

      <div className="card-glass shimmer-border p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[var(--color-text-muted)] text-xs font-medium tracking-wider uppercase">
            Sync Status
          </span>
          <div className={syncDotClass} />
        </div>
        <p className="text-2xl font-semibold tracking-tight">
          {syncLabel}
        </p>
      </div>
    </div>
  )
}

export { NetworkStatus }
