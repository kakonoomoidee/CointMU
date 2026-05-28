import { useRpcPort, useNetworkStatus } from '@/hooks'
import { NetworkStatus, NodeInfo, IconEyeSlash } from '@/components'
import { formatChainId } from '@/utils'

const COINTMU_NETWORK_DISPLAY_ID = '1024'

/**
 * Primary dashboard view composing the network status grid and local node
 * information panel. Orchestrates the RPC port resolution and network polling
 * lifecycle through custom hooks.
 * @returns The complete dashboard layout with header, status cards, and node panel.
 */
function Dashboard(): JSX.Element {
  const { port, loading } = useRpcPort()
  const networkStatus = useNetworkStatus(port)

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface-primary)]">
      <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center">
            <svg
              width="20"
              height="20"
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
            <h1 className="text-lg font-semibold tracking-tight gradient-text">
              CointMU
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] tracking-wide">
              Desktop Node Client
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-tertiary)] border border-[var(--color-border-subtle)]">
            <div
              className={
                networkStatus.connected
                  ? 'status-dot status-dot-online'
                  : 'status-dot status-dot-offline'
              }
            />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {networkStatus.connected ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <IconEyeSlash width={16} height={16} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-sm font-medium tracking-wider uppercase text-[var(--color-text-muted)] mb-4">
              Network Overview
            </h2>
            <NetworkStatus status={networkStatus} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <NodeInfo
                port={port}
                loading={loading}
                connected={networkStatus.connected}
                lastUpdated={networkStatus.lastUpdated}
                networkId={
                  networkStatus.chainId
                    ? formatChainId(networkStatus.chainId)
                    : COINTMU_NETWORK_DISPLAY_ID
                }
              />
            </div>

            <div
              className="lg:col-span-2 card-glass p-6 animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <h2 className="text-sm font-medium tracking-wider uppercase text-[var(--color-text-muted)] mb-5">
                Node Activity
              </h2>
              <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-[var(--color-border-subtle)]">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-40"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Activity data will appear when the node is synchronized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 py-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-muted)]">
          CointMU Desktop v1.0.0
        </span>
        <span className="text-xs text-[var(--color-text-muted)] font-[family-name:var(--font-family-mono)]">
          Chain {COINTMU_NETWORK_DISPLAY_ID}
        </span>
      </footer>
    </div>
  )
}

export { Dashboard }
