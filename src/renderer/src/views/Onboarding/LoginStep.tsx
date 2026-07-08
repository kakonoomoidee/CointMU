import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboardingStore } from '@/store'
import { PasswordField } from './PasswordField'

interface LoginStepProps {
  onUnlock: () => void
  onBack: () => void
}

/**
 * Login step allowing the user to unlock an existing encrypted wallet. The
 * password field and error state are read from the onboarding store; verification
 * and session unlocking are delegated to the orchestrator via onUnlock.
 * @param props - The unlock and back navigation handlers.
 * @returns The rendered login step.
 */
function LoginStep({ onUnlock, onBack }: LoginStepProps): JSX.Element {
  const { t } = useTranslation()
  const password = useOnboardingStore((s) => s.password)
  const showPassword = useOnboardingStore((s) => s.showPassword)
  const error = useOnboardingStore((s) => s.error)
  const setPassword = useOnboardingStore((s) => s.setPassword)
  const setShowPassword = useOnboardingStore((s) => s.setShowPassword)
  const setError = useOnboardingStore((s) => s.setError)

  return (
    <div className="w-full flex flex-col gap-5">
      <PasswordField
        label={t('onboarding.login.enterPassword')}
        value={password}
        placeholder={t('onboarding.login.passwordPlaceholder')}
        show={showPassword}
        onChange={(value) => {
          setPassword(value)
          setError(null)
        }}
        onToggleShow={() => setShowPassword(!showPassword)}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          {t('onboarding.login.back')}
        </button>
        <button
          onClick={onUnlock}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {t('onboarding.login.unlock')}
        </button>
      </div>
    </div>
  )
}

export { LoginStep }
export type { LoginStepProps }
