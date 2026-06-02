import { useEffect, useRef, useState, type JSX } from 'react'
import { useSecurityStore } from '@/store'
import { useBiometrics, useHardwareDetection } from '@/hooks'
import { RevealPrivateKeyModal } from './RevealPrivateKeyModal'
import { RecoveryPhraseModal } from './RecoveryPhraseModal'
import { ExportKeystoreModal } from './ExportKeystoreModal'
import { ResetWalletModal } from './ResetWalletModal'

type HardwareDevice = 'ledger' | 'trezor'

const CONNECT_FEEDBACK_MS = 1500

interface ToggleProps {
  value: boolean
  onChange: () => void
}

/**
 * Shared pill-switch toggle used by the lock preferences.
 * @param props - The current value and the change handler.
 * @returns The rendered toggle button.
 */
function Toggle({ value, onChange }: ToggleProps): JSX.Element {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

/**
 * Security settings pane. Self-contained: lock preferences come from the
 * security store, biometric availability gates the Touch ID row, and the
 * recovery, keystore-export, private-key, and reset flows each open a dedicated
 * password-gated modal.
 * @returns The Security Settings form component.
 */
export function SecuritySettings(): JSX.Element {
  const settings = useSecurityStore((s) => s.settings)
  const toggleAutoLock = useSecurityStore((s) => s.toggleAutoLock)
  const toggleRequireBiometrics = useSecurityStore((s) => s.toggleRequireBiometrics)
  const { isSupported: biometricsSupported } = useBiometrics()
  const hasDevice = useHardwareDetection()

  const [showReveal, setShowReveal] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [connecting, setConnecting] = useState<HardwareDevice | null>(null)

  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current)
    }
  }, [])

  const handleConnect = (device: HardwareDevice): void => {
    setConnecting(device)
    connectTimerRef.current = setTimeout(() => {
      setConnecting(null)
    }, CONNECT_FEEDBACK_MS)
  }

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
              <Toggle value={settings.autoLock} onChange={toggleAutoLock} />
            </div>

            {biometricsSupported && (
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Require Touch ID / Windows Hello to sign</p>
                  <p className="text-xs text-slate-500 mt-0.5">Use biometrics to authorize every transaction</p>
                </div>
                <Toggle value={settings.requireBiometrics} onChange={toggleRequireBiometrics} />
              </div>
            )}
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
              <button
                onClick={() => setShowRecovery(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                Reveal...
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Export keystore</p>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted JSON keystore for backup</p>
              </div>
              <button
                onClick={() => setShowExport(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
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
              <button
                onClick={() => handleConnect('ledger')}
                disabled={!hasDevice || connecting !== null}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!hasDevice ? 'No USB detected' : connecting === 'ledger' ? 'Connecting...' : 'Connect'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Trezor</p>
                <p className="text-xs text-slate-500 mt-0.5">Connect a Trezor device</p>
              </div>
              <button
                onClick={() => handleConnect('trezor')}
                disabled={!hasDevice || connecting !== null}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!hasDevice ? 'No USB detected' : connecting === 'trezor' ? 'Connecting...' : 'Connect'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 mt-6 border-t border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-800">Reset wallet</p>
                <p className="text-xs text-slate-500 mt-0.5">Removes all accounts and keys from this device. Cannot be undone.</p>
              </div>
              <button
                onClick={() => setShowReset(true)}
                className="px-3 py-1.5 bg-red-500 text-white border border-red-600 rounded-lg text-xs font-bold hover:bg-red-600 shadow-sm transition-colors"
              >
                Reset...
              </button>
            </div>
          </div>
        </section>
      </div>

      {showReveal && <RevealPrivateKeyModal onClose={() => setShowReveal(false)} />}
      {showRecovery && <RecoveryPhraseModal onClose={() => setShowRecovery(false)} />}
      {showExport && <ExportKeystoreModal onClose={() => setShowExport(false)} />}
      {showReset && <ResetWalletModal onClose={() => setShowReset(false)} />}
    </div>
  )
}
