import { formatPortDisplay, formatTimestamp } from '@/utils'
import { type JSX } from 'react'

interface NodeInfoProps {
  port: number | null
  loading: boolean
  connected: boolean
  lastUpdated: number | null
  networkId: string | null
}

/**
 * Displays local node connection information including RPC port, connection
 * state, network identifier, and the last data refresh timestamp.
 * @param props - Node connection metadata from hooks and IPC bridge.
 * @returns A styled information panel for the local node status.
 */
function NodeInfo({
  port,
  loading,
  connected,
  lastUpdated,
  networkId
}: NodeInfoProps): JSX.Element {
  const connectionLabel = loading ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'
  const connectionDotClass = loading
    ? 'status-dot status-dot-syncing'
    : connected
      ? 'status-dot status-dot-online'
      : 'status-dot status-dot-offline'

  return (
    <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h2 className="text-sm font-medium tracking-wider uppercase text-[var(--color-text-muted)] mb-5">
        Local Node
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-secondary)] text-sm">Status</span>
          <div className="flex items-center gap-2">
            <div className={connectionDotClass} />
            <span className="text-sm font-medium">{connectionLabel}</span>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border-subtle)]" />

        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-secondary)] text-sm">RPC Port</span>
          <span className="text-sm font-medium font-[family-name:var(--font-family-mono)] text-[var(--color-accent-glow)]">
            {loading ? '...' : formatPortDisplay(port)}
          </span>
        </div>

        <div className="h-px bg-[var(--color-border-subtle)]" />

        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-secondary)] text-sm">Network ID</span>
          <span className="text-sm font-medium font-[family-name:var(--font-family-mono)]">
            {networkId ?? '--'}
          </span>
        </div>

        <div className="h-px bg-[var(--color-border-subtle)]" />

        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-secondary)] text-sm">Last Update</span>
          <span className="text-sm text-[var(--color-text-muted)] font-[family-name:var(--font-family-mono)]">
            {formatTimestamp(lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  )
}

export { NodeInfo }
