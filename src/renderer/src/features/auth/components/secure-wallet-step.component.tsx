import { MIN_PASSWORD_LENGTH } from '../auth.constants'
import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../auth.store'
import { PasswordField } from './password-field.component'
import { Lock } from 'lucide-react'


interface SecureWalletStepProps {
  onSave: () => void
  onBack: () => void
}

/**
 * Password creation step shared by the create and import flows. It collects and
 * confirms the password used to encrypt the wallet secret; the encryption itself
 * is performed by the orchestrator through the secure crypto IPC service. The
 * field values and error state are read from the AuthFlow store.
 * @param props - The save and back navigation handlers.
 * @returns The rendered secure wallet step.
 */
function SecureWalletStep({ onSave, onBack }: SecureWalletStepProps): JSX.Element {
  const { t } = useTranslation()
  const password = useAuthStore((s) => s.password)
  const confirmPassword = useAuthStore((s) => s.confirmPassword)
  const showPassword = useAuthStore((s) => s.showPassword)
  const showConfirmPassword = useAuthStore((s) => s.showConfirmPassword)
  const error = useAuthStore((s) => s.error)
  const setPassword = useAuthStore((s) => s.setPassword)
  const setConfirmPassword = useAuthStore((s) => s.setConfirmPassword)
  const setShowPassword = useAuthStore((s) => s.setShowPassword)
  const setShowConfirmPassword = useAuthStore((s) => s.setShowConfirmPassword)
  const setError = useAuthStore((s) => s.setError)

  const isValid =
    password.length >= MIN_PASSWORD_LENGTH && password === confirmPassword

  return (
    <div className="w-full flex flex-col gap-4">
      <PasswordField
        label={t('auth.secureWallet.newPassword')}
        value={password}
        placeholder={t('auth.secureWallet.newPasswordPlaceholder')}
        show={showPassword}
        onChange={(value) => {
          setPassword(value)
          setError(null)
        }}
        onToggleShow={() => setShowPassword(!showPassword)}
      />
      <PasswordField
        label={t('auth.secureWallet.confirmPassword')}
        value={confirmPassword}
        placeholder={t('auth.secureWallet.confirmPasswordPlaceholder')}
        show={showConfirmPassword}
        onChange={(value) => {
          setConfirmPassword(value)
          setError(null)
        }}
        onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          {t('auth.secureWallet.back')}
        </button>
        <button
          onClick={onSave}
          disabled={!isValid}
          className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock width={16} height={16} strokeWidth={2.5} />
          {t('auth.secureWallet.encryptAndSave')}
        </button>
      </div>
    </div>
  )
}

export { SecureWalletStep }
export type { SecureWalletStepProps }



