import { create } from 'zustand'

type OnboardingStep =
  | 'initial'
  | 'login'
  | 'create-seed'
  | 'create-password'
  | 'import-method'
  | 'import-input'
  | 'import-password'

type ImportMethod = 'seed' | 'privateKey'

interface OnboardingStore {
  step: OnboardingStep
  hasExistingWallet: boolean
  mnemonic: string
  copied: boolean
  importMethod: ImportMethod
  inputValue: string
  password: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  error: string | null
  setStep: (step: OnboardingStep) => void
  setHasExistingWallet: (value: boolean) => void
  setMnemonic: (value: string) => void
  setCopied: (value: boolean) => void
  setImportMethod: (value: ImportMethod) => void
  setInputValue: (value: string) => void
  setPassword: (value: string) => void
  setConfirmPassword: (value: string) => void
  setShowPassword: (value: boolean) => void
  setShowConfirmPassword: (value: boolean) => void
  setError: (value: string | null) => void
  reset: () => void
}

/**
 * Holds the transient onboarding wizard state shared between the orchestrator and
 * its step sub-components. Centralizing this state removes the need to drill form
 * values and setters through every step, while the orchestrator retains the
 * login, account-derivation, and encryption business logic. This state is
 * setup-only and intentionally separate from the wallet UI store.
 */
export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 'initial',
  hasExistingWallet: false,
  mnemonic: '',
  copied: false,
  importMethod: 'seed',
  inputValue: '',
  password: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
  error: null,
  setStep: (step) => set({ step }),
  setHasExistingWallet: (hasExistingWallet) => set({ hasExistingWallet }),
  setMnemonic: (mnemonic) => set({ mnemonic }),
  setCopied: (copied) => set({ copied }),
  setImportMethod: (importMethod) => set({ importMethod }),
  setInputValue: (inputValue) => set({ inputValue }),
  setPassword: (password) => set({ password }),
  setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
  setShowPassword: (showPassword) => set({ showPassword }),
  setShowConfirmPassword: (showConfirmPassword) => set({ showConfirmPassword }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      step: 'initial',
      mnemonic: '',
      copied: false,
      importMethod: 'seed',
      inputValue: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      error: null
    })
}))

export type { OnboardingStep, ImportMethod }
