import { useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { SettingsStore } from '@/views/Settings'
import { CustomDropdown } from '@/components/CustomDropdown'

const NETWORK_OPTIONS = [
  'CointMU Mainnet · chain ID 1912',
  'CointMU Testnet · chain ID 7013',
  'Localhost 8545'
]

const MAX_PEERS_OPTIONS = [
  { label: '10', value: 10 },
  { label: '14 (recommended)', value: 14 },
  { label: '25', value: 25 },
  { label: '50', value: 50 }
]

const SYNC_MODE_OPTIONS = ['Snap (recommended)', 'Full', 'Light']

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
  const { t } = useTranslation()
  const [isSwitching, setIsSwitching] = useState(false)

  const handleNetworkSwitch = async (val: string): Promise<void> => {
    onUpdate('network', val)
    
    let chainId = 1912
    if (val.includes('7013')) chainId = 7013
    else if (val.includes('Localhost')) chainId = 1337
    
    setIsSwitching(true)
    try {
      await window.api.network.setChainId(chainId)
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">{t('settings.networkSettings.subtitle')}</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">{t('settings.networkSettings.activeNetwork')}</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.networkTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.networkDesc')}</p>
              </div>
              <div className="w-64">
                <CustomDropdown<string>
                  options={NETWORK_OPTIONS}
                  selected={config.network}
                  onSelect={handleNetworkSwitch}
                  renderSelected={(selected) => selected || NETWORK_OPTIONS[0]}
                  renderOption={(option) => option}
                  compact
                />
                {isSwitching && (
                  <div className="mt-3 text-[11px] text-blue-600 font-medium animate-pulse bg-blue-50 p-2 rounded border border-blue-100">
                    <p>{t('settings.networkSettings.switchingNetwork')}</p>
                    <p className="mt-0.5 opacity-80">{t('settings.networkSettings.restartRequired')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.rpcTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.rpcDesc')}</p>
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
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.chainIdTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.chainIdDesc')}</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">1912</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.blockTimeTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.blockTimeDesc')}</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">30s</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">{t('settings.networkSettings.peers')}</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.maxPeersTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.maxPeersDesc')}</p>
              </div>
              <div className="w-56">
                <CustomDropdown<{ label: string; value: number }>
                  options={MAX_PEERS_OPTIONS}
                  selected={MAX_PEERS_OPTIONS.find((opt) => opt.value === config.maxPeers) || MAX_PEERS_OPTIONS[1]}
                  onSelect={(val) => onUpdate('maxPeers', val.value)}
                  renderSelected={(selected) => selected?.label}
                  renderOption={(option) => option.label}
                  compact
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.discoveryTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.discoveryDesc')}</p>
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
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.listenPortTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.listenPortDesc')}</p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-700">{config.listenPort}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.connectedPeersTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.connectedPeersDesc', { count: 14 })}</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                {t('settings.networkSettings.viewList')}
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">{t('settings.networkSettings.sync')}</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="pr-4">
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.syncModeTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('settings.networkSettings.syncModeDesc')}</p>
              </div>
              <div className="w-56 flex-shrink-0">
                <CustomDropdown<string>
                  options={SYNC_MODE_OPTIONS}
                  selected={config.syncMode}
                  onSelect={(val) => onUpdate('syncMode', val)}
                  renderSelected={(selected) => selected || SYNC_MODE_OPTIONS[0]}
                  renderOption={(option) => option}
                  compact
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.networkSettings.pruneTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.networkSettings.pruneDesc')}</p>
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
