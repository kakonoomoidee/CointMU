import { useEffect, useState, type JSX } from 'react'
import { useAdvancedStore } from '@/store'
import { IconChevronDown } from '@/assets/icons'

const LOG_LEVELS = ['Info', 'Debug', 'Warn', 'Error']

/**
 * Formats a byte count into a compact human-readable size string.
 * @param {number} bytes - The number of bytes to format.
 * @returns {string} The formatted size (for example '4.82 GB').
 */
function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`
}

/**
 * Advanced settings pane. Self-contained: developer/RPC preferences come from
 * the advanced store, and the storage section reads the live datadir and chain
 * database size from the main process via IPC.
 * @returns The Advanced Settings form component.
 */
export function AdvancedSettings(): JSX.Element {
  const settings = useAdvancedStore((s) => s.settings)
  const storage = useAdvancedStore((s) => s.storage)
  const updateSettings = useAdvancedStore((s) => s.updateSettings)
  const fetchStorageInfo = useAdvancedStore((s) => s.fetchStorageInfo)

  const [corsDraft, setCorsDraft] = useState(settings.corsOrigins)

  useEffect(() => {
    void fetchStorageInfo()
  }, [fetchStorageInfo])

  useEffect(() => {
    setCorsDraft(settings.corsOrigins)
  }, [settings.corsOrigins])

  const handleCorsBlur = (): void => {
    if (corsDraft !== settings.corsOrigins) {
      updateSettings({ corsOrigins: corsDraft })
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">Developer APIs, local storage, and diagnostics</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">RPC/Network</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Enable JSON-RPC over HTTP</p>
                <p className="text-xs text-slate-500 mt-0.5">Listen on 127.0.0.1:8545 for dApp connections</p>
              </div>
              <button
                onClick={() => updateSettings({ httpRpc: !settings.httpRpc })}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${settings.httpRpc ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${settings.httpRpc ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Enable WebSocket RPC</p>
                <p className="text-xs text-slate-500 mt-0.5">Listen on 127.0.0.1:8546</p>
              </div>
              <button
                onClick={() => updateSettings({ wsRpc: !settings.wsRpc })}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${settings.wsRpc ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${settings.wsRpc ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">CORS allowed origins</p>
                <p className="text-xs text-slate-500 mt-0.5">Origins allowed to connect to the RPC server</p>
              </div>
              <div className="w-64">
                <input
                  type="text"
                  value={corsDraft}
                  onChange={(e) => setCorsDraft(e.target.value)}
                  onBlur={handleCorsBlur}
                  placeholder="https://*.cointmu.net"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Storage</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">Datadir</p>
                <p className="text-xs text-slate-500 mt-0.5">Where chain data and keystore are stored</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700 truncate max-w-[16rem]" title={storage.datadir}>
                {storage.datadir || 'Loading...'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">Chain database size</p>
                <p className="text-xs text-slate-500 mt-0.5">Approximate disk usage</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">{formatBytes(storage.dbSize)}</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Open data folder</p>
                <p className="text-xs text-slate-500 mt-0.5">Reveal the datadir in your file explorer</p>
              </div>
              <button
                onClick={() => void window.api.openDataFolder()}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                Reveal
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Diagnostics</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Log level</p>
                <p className="text-xs text-slate-500 mt-0.5">Verbosity of the node log</p>
              </div>
              <div className="relative">
                <select
                  value={settings.logLevel}
                  onChange={(e) => updateSettings({ logLevel: e.target.value })}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  {LOG_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <IconChevronDown width={12} height={12} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Send anonymous analytics</p>
                <p className="text-xs text-slate-500 mt-0.5">Help improve CointMU with crash reports and usage data</p>
              </div>
              <button
                onClick={() => updateSettings({ analytics: !settings.analytics })}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${settings.analytics ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${settings.analytics ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
