import { useState, useEffect, type JSX } from 'react'
import { useNetworkStats, useUpdateStatus } from '@/hooks'

/**
 * Formats raw system uptime seconds into a readable string.
 * @param {number} seconds - The total uptime in seconds.
 * @returns {string} The formatted uptime string.
 */
const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (d > 0) return `${d} days ${h} hours`
  if (h > 0) return `${h} hours ${m} minutes`
  if (m > 0) return `${m} minutes ${s} seconds`
  return `${s} seconds`
}

/**
 * Returns the appropriate label text for the update button based on the
 * current update lifecycle status.
 * @param {string} status - The current update status identifier.
 * @returns {string} The human-readable button label.
 */
const getUpdateButtonLabel = (status: string): string => {
  if (status === 'checking') return 'Checking...'
  if (status === 'available') return 'Downloading update...'
  if (status === 'downloading') return 'Downloading...'
  if (status === 'ready') return 'Restart to install'
  return 'Check for updates'
}

/**
 * About pane containing system information, node version, chain ID,
 * uptime, external resource links, and an integrated auto-update control
 * bound to the Electron IPC bridge.
 * @returns {JSX.Element} The About Settings view component.
 */
export function AboutSettings(): JSX.Element {
  const [uptimeStr, setUptimeStr] = useState<string>('Loading...')
  const networkStats = useNetworkStats()
  const updateState = useUpdateStatus()

  const sysInfo = window.systemInfo || {
    version: '0.0.1',
    build: 0,
    platform: 'Unknown',
    nodeVersion: 'Unknown',
    getUptime: () => 0
  }

  useEffect(() => {
    const updateUptime = (): void => {
      setUptimeStr(formatUptime(sysInfo.getUptime()))
    }
    updateUptime()
    const interval = setInterval(updateUptime, 60000)
    return () => clearInterval(interval)
  }, [])

  /**
   * Dispatches the appropriate update action based on the current lifecycle
   * status through the Electron IPC bridge.
   * @returns {void}
   */
  const handleUpdateAction = (): void => {
    if (updateState.status === 'ready') {
      window.api?.updater?.quitAndInstall()
      return
    }
    if (updateState.status === 'idle') {
      window.api?.updater?.checkForUpdates()
    }
  }

  const isButtonDisabled = updateState.status === 'checking'
    || updateState.status === 'available'
    || updateState.status === 'downloading'

  return (
    <div>
      <div className="flex items-start gap-6 mb-12">
        <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CointMU</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Version {window.systemInfo?.version || '0.0.1'} (build {window.systemInfo?.build || 0}) {'\u2022'} {window.systemInfo?.platform || 'Unknown'}
          </p>
          <p className="text-sm font-medium text-slate-400 mt-1">{'\u00A9'} 2026 CointMU Foundation {'\u2022'} MIT License</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpdateAction}
              disabled={isButtonDisabled}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors ${
                updateState.status === 'ready'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : isButtonDisabled
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {getUpdateButtonLabel(updateState.status)}
            </button>
            <button className="px-4 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-200 transition-colors">
              Release notes
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">System</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Node version</p>
              <span className="text-sm font-medium font-mono text-slate-600">cointmu/v{sysInfo.version}-stable (Node v{sysInfo.nodeVersion})</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Chain ID</p>
              <span className="text-sm font-medium font-mono text-slate-600">7012</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Connected peers</p>
              <span className="text-sm font-medium font-mono text-slate-600">{networkStats.peerCount !== null ? networkStats.peerCount : '--'}</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Uptime</p>
              <span className="text-sm font-bold text-slate-800">{uptimeStr}</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Links</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Documentation</p>
                <p className="text-xs text-slate-500 mt-0.5">Guides, API reference, RPC schema</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">{'Open \u203A'}</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">GitHub</p>
                <p className="text-xs text-slate-500 mt-0.5">github.com/cointmu/node</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">{'Open \u203A'}</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Report an issue</p>
                <p className="text-xs text-slate-500 mt-0.5">Send a bug report or feature request</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">{'Open \u203A'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
