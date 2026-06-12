import type { JSX } from 'react'
import type { SettingsStore } from '@/views/Settings'
import { IconChevronDown } from '@/assets/icons'

interface NetworkSettingsProps {
  config: SettingsStore['network']
  onUpdate: (key: string, value: any) => void
}

/**
 * Network settings pane containing active network configuration, RPC endpoints,
 * peer bounds, and sync mode configuration.
 * @param props The configuration state and the update callback.
 * @returns The Network Settings form component.
 */
export function NetworkSettings({ config, onUpdate }: NetworkSettingsProps): JSX.Element {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">Connection, RPC endpoints, and chain selection</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Active Network</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Network</p>
                <p className="text-xs text-slate-500 mt-0.5">Which chain CointMU is connected to</p>
              </div>
              <div className="relative">
                <select
                  value={config.network}
                  onChange={(e) => onUpdate('network', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option>CointMU Mainnet · chain ID 1912</option>
                  <option>CointMU Testnet · chain ID 7013</option>
                  <option>Localhost 8545</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <IconChevronDown width={12} height={12} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">RPC endpoint</p>
                <p className="text-xs text-slate-500 mt-0.5">Where transactions and queries are sent</p>
              </div>
              <div className="w-64">
                <input
                  type="text"
                  value={config.rpcEndpoint}
                  onChange={(e) => onUpdate('rpcEndpoint', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">Chain ID</p>
                <p className="text-xs text-slate-500 mt-0.5">Used for transaction signing</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">1912</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">Block time</p>
                <p className="text-xs text-slate-500 mt-0.5">Target time between blocks</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">30s</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Peers</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Max peers</p>
                <p className="text-xs text-slate-500 mt-0.5">Upper bound on simultaneous peer connections</p>
              </div>
              <div className="relative">
                <select
                  value={config.maxPeers}
                  onChange={(e) => onUpdate('maxPeers', parseInt(e.target.value))}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={14}>14 (recommended)</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <IconChevronDown width={12} height={12} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Discovery</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically find new peers via DHT</p>
              </div>
              <button
                onClick={() => onUpdate('discovery', !config.discovery)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.discovery ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.discovery ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">Listen port</p>
                <p className="text-xs text-slate-500 mt-0.5">UDP / TCP port used by the gossip protocol</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">{config.listenPort}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">Connected peers</p>
                <p className="text-xs text-slate-500 mt-0.5">14 nodes currently gossiping with you</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                View list
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Sync</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="pr-4">
                <p className="text-sm font-bold text-slate-800">Sync mode</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Snap downloads pruned state quickly. Full validates every block from genesis</p>
              </div>
              <div className="relative flex-shrink-0">
                <select
                  value={config.syncMode}
                  onChange={(e) => onUpdate('syncMode', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option>Snap (recommended)</option>
                  <option>Full</option>
                  <option>Light</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <IconChevronDown width={12} height={12} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Prune old state</p>
                <p className="text-xs text-slate-500 mt-0.5">Keep last 128 blocks of historical state to save disk</p>
              </div>
              <button
                onClick={() => onUpdate('pruneOldState', !config.pruneOldState)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.pruneOldState ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.pruneOldState ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
