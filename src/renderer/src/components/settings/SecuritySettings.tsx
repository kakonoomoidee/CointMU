import { useState, type JSX } from 'react'
import type { SettingsStore } from '@/views/Settings'
import { RevealPrivateKeyModal } from './RevealPrivateKeyModal'

interface SecuritySettingsProps {
  config: SettingsStore['security']
  onUpdate: (key: string, value: any) => void
}

/**
 * Security settings pane containing auto-lock behavior, recovery phrase
 * and keystore exports, and hardware wallet connections.
 * @param props The configuration state and the update callback.
 * @returns The Security Settings form component.
 */
export function SecuritySettings({ config, onUpdate }: SecuritySettingsProps): JSX.Element {
  const [showReveal, setShowReveal] = useState(false)

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">Wallet security, backups, and hardware keys</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Lock</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Auto-lock wallet</p>
                <p className="text-xs text-slate-500 mt-0.5">Lock keys after 5 minutes of inactivity</p>
              </div>
              <button
                onClick={() => onUpdate('autoLockWallet', !config.autoLockWallet)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.autoLockWallet ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.autoLockWallet ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Require Touch ID to sign</p>
                <p className="text-xs text-slate-500 mt-0.5">Use biometrics to authorize every transaction</p>
              </div>
              <button
                onClick={() => onUpdate('requireTouchId', !config.requireTouchId)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.requireTouchId ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.requireTouchId ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Recovery</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Recovery phrase</p>
                <p className="text-xs text-slate-500 mt-0.5">12-word seed used to restore your wallet</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                Reveal...
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Export keystore</p>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted JSON keystore for backup</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Reveal private key</p>
                <p className="text-xs text-slate-500 mt-0.5">Decrypt and display the raw private key for an account</p>
              </div>
              <button
                onClick={() => setShowReveal(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                Reveal...
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Hardware Wallets</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Ledger</p>
                <p className="text-xs text-slate-500 mt-0.5">Connect a Ledger device via USB</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Trezor</p>
                <p className="text-xs text-slate-500 mt-0.5">Connect a Trezor device</p>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 mt-6 border-t border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-800">Reset wallet</p>
                <p className="text-xs text-slate-500 mt-0.5">Removes all accounts and keys from this device. Cannot be undone.</p>
              </div>
              <button className="px-3 py-1.5 bg-red-500 text-white border border-red-600 rounded-lg text-xs font-bold hover:bg-red-600 shadow-sm transition-colors">
                Reset...
              </button>
            </div>
          </div>
        </section>
      </div>

      {showReveal && <RevealPrivateKeyModal onClose={() => setShowReveal(false)} />}
    </div>
  )
}
