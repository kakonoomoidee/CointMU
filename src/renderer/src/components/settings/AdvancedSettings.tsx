import type { JSX } from 'react'
import type { SettingsStore } from '@/views/Settings'
import { IconChevronDown } from '@/assets/icons'

interface AdvancedSettingsProps {
  config: SettingsStore['advanced']
  onUpdate: (key: string, value: any) => void
}

/**
 * Advanced settings pane containing JSON-RPC toggles, CORS origin rules,
 * storage datadir paths, and internal diagnostic settings.
 * @param props The configuration state and the update callback.
 * @returns The Advanced Settings form component.
 */
export function AdvancedSettings({ config, onUpdate }: AdvancedSettingsProps): JSX.Element {
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
                onClick={() => onUpdate('enableJsonRpc', !config.enableJsonRpc)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.enableJsonRpc ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.enableJsonRpc ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Enable WebSocket RPC</p>
                <p className="text-xs text-slate-500 mt-0.5">Listen on 127.0.0.1:8546</p>
              </div>
              <button
                onClick={() => onUpdate('enableWsRpc', !config.enableWsRpc)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.enableWsRpc ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.enableWsRpc ? 'translate-x-5' : 'translate-x-0'}`} />
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
                  value={config.corsOrigins}
                  onChange={(e) => onUpdate('corsOrigins', e.target.value)}
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
            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">Datadir</p>
                <p className="text-xs text-slate-500 mt-0.5">Where chain data and keystore are stored</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">~/Library/CointMU</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">Chain database size</p>
                <p className="text-xs text-slate-500 mt-0.5">Approximate disk usage</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">4.82 GB</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Open data folder</p>
                <p className="text-xs text-slate-500 mt-0.5">Reveal the datadir in Finder</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
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
                  value={config.logLevel}
                  onChange={(e) => onUpdate('logLevel', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option>Info</option>
                  <option>Debug</option>
                  <option>Trace</option>
                  <option>Error</option>
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
                onClick={() => onUpdate('sendAnalytics', !config.sendAnalytics)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.sendAnalytics ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.sendAnalytics ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
