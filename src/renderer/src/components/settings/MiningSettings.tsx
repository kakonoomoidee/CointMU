import { useState, useEffect, useRef, type JSX } from 'react'
import type { SettingsStore } from '@/views/Settings'

interface MiningSettingsProps {
  config: SettingsStore['mining']
  accounts?: { address: string; label: string }[]
  onUpdate: (key: string, value: any) => void
}

const DEBOUNCE_DELAY_MS = 800
const MAX_CORES = navigator.hardwareConcurrency || 8

/**
 * Mining settings pane configuring internal node worker threads, intensity,
 * battery behavior, pool vs solo mode, and payout addresses. Actively controls
 * the underlying Geth node via IPC bridge when settings are changed.
 * @param {MiningSettingsProps} props - The configuration state and the update callback.
 * @returns {JSX.Element} The Mining Settings form component.
 */
export function MiningSettings({ config, accounts = [], onUpdate }: MiningSettingsProps): JSX.Element {
  const [rewardInput, setRewardInput] = useState<string>(config.poolAddress || '')
  
  const isAddressInAccounts = (address: string) => accounts.some(acc => acc.address === address)
  const [selectionMode, setSelectionMode] = useState<'local' | 'custom'>(() => {
    return isAddressInAccounts(config.poolAddress) || !config.poolAddress ? 'local' : 'custom'
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setRewardInput(config.poolAddress || '')
    if (isAddressInAccounts(config.poolAddress) || !config.poolAddress) {
      setSelectionMode('local')
    } else {
      setSelectionMode('custom')
    }
  }, [config.poolAddress, accounts])

  useEffect(() => {
    const ensureEtherbase = async (): Promise<void> => {
      const activeAddress = await window.api.settings.get('activeWalletAddress')
      if (!activeAddress || activeAddress.length !== 42) {
        if (accounts.length > 0) {
          await window.api.settings.set('activeWalletAddress', accounts[0].address)
        }
      }
    }
    ensureEtherbase()
  }, [accounts])

  /**
   * Handles the Enable Mining toggle switch.
   * @param {boolean} isEnabled - The new active state of the mining toggle.
   * @returns {Promise<void>}
   */
  const handleToggleMining = async (isEnabled: boolean): Promise<void> => {
    onUpdate('isMiningEnabled', isEnabled)
    await window.api.settings.set('mining.isMiningEnabled', isEnabled)

    const activeAddress = await window.api.settings.get('activeWalletAddress')
    if (isEnabled && (!activeAddress || activeAddress.length !== 42)) {
      if (accounts.length > 0) {
        await window.api.settings.set('activeWalletAddress', accounts[0].address)
      } else {
        console.warn('Cannot enable mining: No active wallet address available')
        onUpdate('isMiningEnabled', false)
        await window.api.settings.set('mining.isMiningEnabled', false)
        return
      }
    }

    try {
      await window.api?.mining?.toggle(isEnabled)
    } catch (err) {
      console.error('Failed to toggle miner', err)
      onUpdate('isMiningEnabled', !isEnabled)
      await window.api.settings.set('mining.isMiningEnabled', !isEnabled)
    }
  }

  /**
   * Handles the CPU thread slider value change.
   * @param {number} newCores - The newly selected core count.
   * @returns {Promise<void>}
   */
  const handleThreadChange = async (newCores: number): Promise<void> => {
    onUpdate('cpuThreads', newCores)
    await window.api.settings.set('mining.cpuThreads', newCores)
    
    try {
      // Directly trigger the backend to update Geth miner threads
      await window.api?.mining?.setThreads(newCores)
    } catch (err) {
      console.error('Failed to update threads', err)
    }
  }

  /**
   * Debounces the pool address input and dispatches the miner_setEtherbase
   * RPC call after the user stops typing. Reverts on failure.
   * @param {string} value - The raw input value from the address field.
   * @returns {void}
   */
  const handlePoolAddressChange = (value: string): void => {
    setRewardInput(value)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(async () => {
      const previous = config.poolAddress
      onUpdate('poolAddress', value)
      if (value.startsWith('0x') && value.length === 42) {
        try {
          await window.api?.mining?.setPoolAddress(value)
        } catch (err) {
          console.error('Failed to set pool address', err)
          onUpdate('poolAddress', previous)
        }
      }
    }, DEBOUNCE_DELAY_MS)
  }

  /**
   * Handles selection from the local wallets dropdown.
   * @param {string} value - The selected address or 'custom'.
   * @returns {Promise<void>}
   */
  const handleDropdownSelection = async (value: string): Promise<void> => {
    if (value === 'custom') {
      setSelectionMode('custom')
      setRewardInput('')
    } else {
      setSelectionMode('local')
      setRewardInput(value)
      const previous = config.poolAddress
      onUpdate('poolAddress', value)
      try {
        await window.api?.mining?.setPoolAddress(value)
      } catch (err) {
        console.error('Failed to set pool address', err)
        onUpdate('poolAddress', previous)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

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
                onClick={() => handleToggleMining(!config.isMiningEnabled)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.isMiningEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.isMiningEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
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
                  <p className="text-xs text-slate-500 mt-0.5">Maximum cores used for hashing ({config.cpuThreads}/{MAX_CORES} allocated)</p>
                </div>
                <span className="text-sm font-bold font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded">
                  {config.cpuThreads} cores
                </span>
              </div>
              
              <div className="flex gap-1 h-3 mb-2">
                {Array.from({ length: MAX_CORES }, (_, i) => i + 1).map((core) => (
                  <button
                    key={core}
                    onClick={() => handleThreadChange(core)}
                    className={`flex-1 rounded-sm transition-colors ${
                      core <= config.cpuThreads ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                    title={`${core} cores`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                <span>1</span>
                <span>{Math.ceil(MAX_CORES / 2)}</span>
                <span>{MAX_CORES}</span>
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
                  value={config.miningMode}
                  onChange={(e) => onUpdate('miningMode', e.target.value)}
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

            <div className="p-4 flex flex-col gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800 mb-0.5">Reward address</p>
                <p className="text-xs text-slate-500">Where coinbase rewards are sent (defaults to main wallet)</p>
              </div>
              
              <div className="relative">
                <select
                  value={selectionMode === 'local' ? rewardInput : 'custom'}
                  onChange={(e) => handleDropdownSelection(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="" disabled>Select a wallet...</option>
                  {accounts.map(acc => (
                    <option key={acc.address} value={acc.address}>
                      {acc.label} ({acc.address.substring(0, 6)}...{acc.address.substring(acc.address.length - 4)})
                    </option>
                  ))}
                  <option value="custom">Custom address...</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {selectionMode === 'custom' && (
                <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                  </div>
                  <input
                    type="text"
                    value={rewardInput}
                    onChange={(e) => handlePoolAddressChange(e.target.value)}
                    placeholder="0xC0a7d4abcdef0011223344556677889900aa7e90a1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
