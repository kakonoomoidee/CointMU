import type { JSX } from 'react'
import type { SettingsStore } from '@/views/Settings'

interface MiningSettingsProps {
  config: SettingsStore['mining']
  onUpdate: (key: string, value: any) => void
}

/**
 * Mining settings pane configuring internal node worker threads, intensity,
 * battery behavior, pool vs solo mode, and payout addresses.
 * @param props The configuration state and the update callback.
 * @returns The Mining Settings form component.
 */
export function MiningSettings({ config, onUpdate }: MiningSettingsProps): JSX.Element {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">Manage internal node mining behavior</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Mining</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Enable Mining</p>
                <p className="text-xs text-slate-500 mt-0.5">Allow this client to solve block hashes</p>
              </div>
              <button
                onClick={() => onUpdate('enableMining', !config.enableMining)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.enableMining ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.enableMining ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Start mining at launch</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically begin hashing when CointMU starts</p>
              </div>
              <button
                onClick={() => onUpdate('startAtLaunch', !config.startAtLaunch)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.startAtLaunch ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.startAtLaunch ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Worker</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">CPU threads</p>
                  <p className="text-xs text-slate-500 mt-0.5">Maximum cores used for hashing ({config.threads}/8 allocated)</p>
                </div>
                <span className="text-sm font-bold font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded">
                  {config.threads} cores
                </span>
              </div>
              
              <div className="flex gap-1 h-3 mb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((core) => (
                  <button
                    key={core}
                    onClick={() => onUpdate('threads', core)}
                    className={`flex-1 rounded-sm transition-colors ${
                      core <= config.threads ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                    title={`${core} cores`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                <span>1</span>
                <span>4</span>
                <span>8</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Intensity</p>
                <p className="text-xs text-slate-500 mt-0.5">Limit CPU usage per thread</p>
              </div>
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                {['Eco', 'Balanced', 'Turbo'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onUpdate('intensity', opt)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      config.intensity === opt
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Pause on battery</p>
                <p className="text-xs text-slate-500 mt-0.5">Stop mining when laptop is disconnected from power</p>
              </div>
              <button
                onClick={() => onUpdate('pauseOnBattery', !config.pauseOnBattery)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.pauseOnBattery ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.pauseOnBattery ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Rewards</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Mode</p>
                <p className="text-xs text-slate-500 mt-0.5">Solo vs pool mining</p>
              </div>
              <div className="relative flex-shrink-0">
                <select
                  value={config.mode}
                  onChange={(e) => onUpdate('mode', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option>Solo</option>
                  <option>campuspool.cmu</option>
                  <option>Custom pool...</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm font-bold text-slate-800 mb-0.5">Reward address</p>
              <p className="text-xs text-slate-500 mb-3">Where coinbase rewards are sent (defaults to main wallet)</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                </div>
                <input
                  type="text"
                  value={config.rewardAddress}
                  onChange={(e) => onUpdate('rewardAddress', e.target.value)}
                  placeholder="0xC0a7d4abcdef0011223344556677889900aa7e90a1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
