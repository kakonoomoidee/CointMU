import { useState, useEffect, type JSX } from 'react'
import { useNetworkStats } from '@/hooks'

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
 * About pane containing system information, node version, chain ID,
 * uptime, and external resource links. Does not require configuration state.
 * @returns The About Settings view component.
 */
export function AboutSettings(): JSX.Element {
  const [uptimeStr, setUptimeStr] = useState<string>('Loading...')
  const networkStats = useNetworkStats()

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
            Version {window.systemInfo?.version || '0.0.1'} (build {window.systemInfo?.build || 0}) • {window.systemInfo?.platform || 'Unknown'}
          </p>
          <p className="text-sm font-medium text-slate-400 mt-1">© 2026 CointMU Foundation • MIT License</p>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600 transition-colors">
              Check for updates
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
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">Open ›</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">GitHub</p>
                <p className="text-xs text-slate-500 mt-0.5">github.com/cointmu/node</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">Open ›</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Report an issue</p>
                <p className="text-xs text-slate-500 mt-0.5">Send a bug report or feature request</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">Open ›</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
