import { useEffect, useRef, useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { useSecurityStore } from '@/store'
import { useBiometrics, useHardwareDetection } from '@/hooks'
import { IconShieldCheck } from '@/assets/icons'
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
  const { t } = useTranslation()
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
      <h2 className="text-sm font-semibold text-slate-700 mb-6">{t('settings.securitySettings.subtitle')}</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">{t('settings.securitySettings.access')}</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.securitySettings.autoLockTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.securitySettings.autoLockDesc')}</p>
              </div>
              <Toggle value={settings.autoLock} onChange={toggleAutoLock} />
            </div>

            {biometricsSupported && (
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">{t('settings.securitySettings.biometricsTitle')}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t('settings.securitySettings.biometricsDesc')}</p>
                </div>
                <Toggle value={settings.requireBiometrics} onChange={toggleRequireBiometrics} />
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">{t('settings.securitySettings.backup')}</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <IconShieldCheck className="text-emerald-500" width={16} height={16} />
                    {t('settings.securitySettings.seedPhraseTitle')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{t('settings.securitySettings.seedPhraseDesc')}</p>
                </div>
                <button
                  onClick={() => setShowRecovery(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  {t('settings.securitySettings.reveal')}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.securitySettings.exportTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.securitySettings.exportDesc')}</p>
              </div>
              <button
                onClick={() => setShowExport(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                {t('settings.securitySettings.export')}
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.securitySettings.privateKeyTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.securitySettings.privateKeyDesc')}</p>
              </div>
              <button
                onClick={() => setShowReveal(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                {t('settings.securitySettings.reveal')}
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">{t('settings.securitySettings.hardware')}</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Ledger</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.securitySettings.hardwareDesc', { device: 'Ledger' })}</p>
              </div>
              <button
                onClick={() => handleConnect('ledger')}
                disabled={!hasDevice || connecting !== null}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!hasDevice ? t('settings.securitySettings.noUsb') : connecting === 'ledger' ? t('settings.securitySettings.connecting') : t('settings.securitySettings.connect')}
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Trezor</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.securitySettings.hardwareDesc', { device: 'Trezor' })}</p>
              </div>
              <button
                onClick={() => handleConnect('trezor')}
                disabled={!hasDevice || connecting !== null}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!hasDevice ? t('settings.securitySettings.noUsb') : connecting === 'trezor' ? t('settings.securitySettings.connecting') : t('settings.securitySettings.connect')}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 mt-6 border-t border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-800">{t('settings.securitySettings.resetWalletTitle')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('settings.securitySettings.resetWalletDesc')}</p>
              </div>
              <button
                onClick={() => setShowReset(true)}
                className="px-3 py-1.5 bg-red-500 text-white border border-red-600 rounded-lg text-xs font-bold hover:bg-red-600 shadow-sm transition-colors"
              >
                {t('settings.securitySettings.resetWalletBtn')}
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
