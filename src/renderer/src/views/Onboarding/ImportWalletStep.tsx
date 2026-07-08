import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboardingStore } from '@/store'
import { IconFileText, IconChevronRight, IconKey, IconDownload } from '@/assets/icons'

interface ImportWalletStepProps {
  mode: 'method' | 'input'
  onSelectMethod: (method: 'seed' | 'privateKey') => void
  onSelectKeystore?: () => void
  onContinue: () => void
  onBackToInitial: () => void
  onBackToMethod: () => void
}

/**
 * Import step covering both the recovery-method picker and the secret input. In
 * method mode it offers seed phrase or private key; in input mode it renders the
 * matching field. The selected method and input value are read from the
 * onboarding store.
 * @param props - The current mode, method selection, and navigation handlers.
 * @returns The rendered import wallet step.
 */
function ImportWalletStep({
  mode,
  onSelectMethod,
  onSelectKeystore,
  onContinue,
  onBackToInitial,
  onBackToMethod
}: ImportWalletStepProps): JSX.Element {
  const { t } = useTranslation()
  const importMethod = useOnboardingStore((s) => s.importMethod)
  const inputValue = useOnboardingStore((s) => s.inputValue)
  const setInputValue = useOnboardingStore((s) => s.setInputValue)

  if (mode === 'method') {
    return (
      <div className="w-full flex flex-col gap-4">
        <button
          onClick={() => onSelectMethod('seed')}
          className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <IconFileText width={20} height={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">{t('onboarding.importWallet.seedPhraseTitle')}</p>
              <p className="text-[10px] text-slate-500">{t('onboarding.importWallet.seedPhraseDesc')}</p>
            </div>
          </div>
          <IconChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" width={20} height={20} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => onSelectMethod('privateKey')}
          className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <IconKey width={20} height={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">{t('onboarding.importWallet.privateKeyTitle')}</p>
              <p className="text-[10px] text-slate-500">{t('onboarding.importWallet.privateKeyDesc')}</p>
            </div>
          </div>
          <IconChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" width={20} height={20} strokeWidth={2.5} />
        </button>

        {onSelectKeystore && (
          <button
            onClick={onSelectKeystore}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <IconDownload width={20} height={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">{t('onboarding.importWallet.keystoreTitle')}</p>
                <p className="text-[10px] text-slate-500">{t('onboarding.importWallet.keystoreDesc')}</p>
              </div>
            </div>
            <IconChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" width={20} height={20} strokeWidth={2.5} />
          </button>
        )}

        <button
          onClick={onBackToInitial}
          className="w-full mt-2 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          {t('onboarding.importWallet.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {importMethod === 'seed' ? (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('onboarding.importWallet.seedPhraseLabel')}</label>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            rows={4}
            placeholder={t('onboarding.importWallet.seedPhrasePlaceholder')}
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('onboarding.importWallet.privateKeyLabel')}</label>
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder={t('onboarding.importWallet.privateKeyPlaceholder')}
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBackToMethod}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          {t('onboarding.importWallet.back')}
        </button>
        <button
          onClick={onContinue}
          disabled={!inputValue.trim()}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('onboarding.importWallet.next')}
        </button>
      </div>
    </div>
  )
}

export { ImportWalletStep }
export type { ImportWalletStepProps }
