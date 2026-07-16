import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../auth.store'
import { PasswordField } from './password-field.component'

interface LoginStepProps {
  onUnlock: () => void
  onBack: () => void
}

/**
 * Login step allowing the user to unlock an existing encrypted wallet. The
 * password field and error state are read from the AuthFlow store; verification
 * and session unlocking are delegated to the orchestrator via onUnlock.
 * @param props - The unlock and back navigation handlers.
 * @returns The rendered login step.
 */
function LoginStep({ onUnlock, onBack }: LoginStepProps): JSX.Element {
  const { t } = useTranslation()
  const password = useAuthStore((s) => s.password)
  const showPassword = useAuthStore((s) => s.showPassword)
  const error = useAuthStore((s) => s.error)
  const setPassword = useAuthStore((s) => s.setPassword)
  const setShowPassword = useAuthStore((s) => s.setShowPassword)
  const setError = useAuthStore((s) => s.setError)

  return (
    <div className="w-full flex flex-col gap-5">
      <PasswordField
        label={t('auth.login.enterPassword')}
        value={password}
        placeholder={t('auth.login.passwordPlaceholder')}
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
          {t('auth.login.back')}
        </button>
        <button
          onClick={onUnlock}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {t('auth.login.unlock')}
        </button>
      </div>
    </div>
  )
}

export { LoginStep }
export type { LoginStepProps }



