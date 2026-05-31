import { type JSX } from 'react'
import { useOnboardingStore } from '@/store'
import { PasswordField } from './PasswordField'

const MIN_PASSWORD_LENGTH = 8

interface SecureWalletStepProps {
  onSave: () => void
  onBack: () => void
}

/**
 * Password creation step shared by the create and import flows. It collects and
 * confirms the password used to encrypt the wallet secret; the encryption itself
 * is performed by the orchestrator through the secure crypto IPC service. The
 * field values and error state are read from the onboarding store.
 * @param props - The save and back navigation handlers.
 * @returns The rendered secure wallet step.
 */
function SecureWalletStep({ onSave, onBack }: SecureWalletStepProps): JSX.Element {
  const password = useOnboardingStore((s) => s.password)
  const confirmPassword = useOnboardingStore((s) => s.confirmPassword)
  const showPassword = useOnboardingStore((s) => s.showPassword)
  const showConfirmPassword = useOnboardingStore((s) => s.showConfirmPassword)
  const error = useOnboardingStore((s) => s.error)
  const setPassword = useOnboardingStore((s) => s.setPassword)
  const setConfirmPassword = useOnboardingStore((s) => s.setConfirmPassword)
  const setShowPassword = useOnboardingStore((s) => s.setShowPassword)
  const setShowConfirmPassword = useOnboardingStore((s) => s.setShowConfirmPassword)
  const setError = useOnboardingStore((s) => s.setError)

  const isValid =
    password.length >= MIN_PASSWORD_LENGTH && password === confirmPassword

  return (
    <div className="w-full flex flex-col gap-4">
      <PasswordField
        label="New Password"
        value={password}
        placeholder="At least 8 characters"
        show={showPassword}
        onChange={(value) => {
          setPassword(value)
          setError(null)
        }}
        onToggleShow={() => setShowPassword(!showPassword)}
      />
      <PasswordField
        label="Confirm Password"
        value={confirmPassword}
        placeholder="Confirm your password"
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
          Back
        </button>
        <button
          onClick={onSave}
          disabled={!isValid}
          className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Encrypt & Save
        </button>
      </div>
    </div>
  )
}

export { SecureWalletStep }
export type { SecureWalletStepProps }
