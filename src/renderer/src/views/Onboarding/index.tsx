import { useEffect, type JSX } from 'react'
import ms from 'ms'
import {
  generateMnemonic,
  deriveAccount,
  deriveAccountFromPrivateKey,
  getSetting,
  setSetting,
  encryptSecret,
  verifyPassword,
  unlockSession
} from '@/services'
import { useOnboardingStore } from '@/store'
import { OnboardingShell } from './OnboardingShell'
import { WelcomeStep } from './WelcomeStep'
import { LoginStep } from './LoginStep'
import { CreateWalletStep } from './CreateWalletStep'
import { ImportWalletStep } from './ImportWalletStep'
import { SecureWalletStep } from './SecureWalletStep'

const MIN_PASSWORD_LENGTH = 8
const COPY_FEEDBACK_MS = ms('2s')

interface OnboardingProps {
  onComplete: (address: string) => void
}

/**
 * Secure onboarding orchestrator for CointMU Desktop. It owns the wallet
 * generation, recovery, login, and encryption business logic, sources transient
 * wizard state from the onboarding store, and routes to the active step
 * sub-component. Secrets are encrypted and verified through the secure crypto IPC
 * service so no plaintext password or mnemonic is ever persisted.
 * @param props - Contains the onComplete callback to update the parent state.
 * @returns The onboarding screen component.
 */
export function Onboarding({ onComplete }: OnboardingProps): JSX.Element {
  const step = useOnboardingStore((s) => s.step)
  const importMethod = useOnboardingStore((s) => s.importMethod)
  const hasExistingWallet = useOnboardingStore((s) => s.hasExistingWallet)
  const mnemonic = useOnboardingStore((s) => s.mnemonic)
  const inputValue = useOnboardingStore((s) => s.inputValue)
  const password = useOnboardingStore((s) => s.password)
  const confirmPassword = useOnboardingStore((s) => s.confirmPassword)

  const setStep = useOnboardingStore((s) => s.setStep)
  const setHasExistingWallet = useOnboardingStore((s) => s.setHasExistingWallet)
  const setMnemonic = useOnboardingStore((s) => s.setMnemonic)
  const setCopied = useOnboardingStore((s) => s.setCopied)
  const setImportMethod = useOnboardingStore((s) => s.setImportMethod)
  const setInputValue = useOnboardingStore((s) => s.setInputValue)
  const setPassword = useOnboardingStore((s) => s.setPassword)
  const setConfirmPassword = useOnboardingStore((s) => s.setConfirmPassword)
  const setError = useOnboardingStore((s) => s.setError)

  useEffect(() => {
    async function checkExisting(): Promise<void> {
      const encrypted = await getSetting<string | null>('encryptedPayload')
      if (encrypted) {
        setHasExistingWallet(true)
      }
    }
    checkExisting()
  }, [setHasExistingWallet])

  const handleCopySeed = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(mnemonic)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    } catch {
      setCopied(false)
    }
  }

  const handleStartCreate = (): void => {
    setMnemonic(generateMnemonic())
    setStep('create-seed')
  }

  const handleStartImport = (): void => {
    setStep('import-method')
  }

  const handleLogin = async (): Promise<void> => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    try {
      const encryptedPayload = await getSetting<string | null>('encryptedPayload')
      if (!encryptedPayload) {
        setError('Wallet data corrupted. Please import again.')
        return
      }

      const valid = await verifyPassword(encryptedPayload, password)
      if (!valid) {
        setError('Invalid password')
        return
      }

      const activeAddress = await getSetting<string | null>('activeWalletAddress')
      if (activeAddress) {
        unlockSession(password)
        onComplete(activeAddress)
      } else {
        setError('Wallet data corrupted. Please import again.')
      }
    } catch {
      setError('Failed to decrypt wallet')
    }
  }

  const handleSaveWallet = async (secretKey: string, isPrivateKey: boolean): Promise<void> => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const firstAccount = isPrivateKey
        ? deriveAccountFromPrivateKey(secretKey, 'Main wallet')
        : deriveAccount(secretKey, 0, 'Main wallet')

      const encryptedPayload = await encryptSecret(secretKey, password)

      await setSetting('encryptedPayload', encryptedPayload)
      await setSetting('accounts', [firstAccount])
      await setSetting('activeWalletAddress', firstAccount.address)
      await setSetting('mining.poolAddress', firstAccount.address)

      unlockSession(password)
      onComplete(firstAccount.address)
    } catch {
      setError('Failed to generate account from the provided credentials')
    }
  }

  const goToInitial = (): void => {
    setStep('initial')
    setPassword('')
    setError(null)
  }

  const resetPasswordFields = (): void => {
    setPassword('')
    setConfirmPassword('')
    setError(null)
  }

  return (
    <OnboardingShell step={step} importMethod={importMethod}>
      {step === 'initial' && (
        <WelcomeStep
          hasExistingWallet={hasExistingWallet}
          onLogin={() => setStep('login')}
          onCreate={handleStartCreate}
          onImport={handleStartImport}
        />
      )}

      {step === 'login' && <LoginStep onUnlock={handleLogin} onBack={goToInitial} />}

      {step === 'create-seed' && (
        <CreateWalletStep
          onCopySeed={handleCopySeed}
          onContinue={() => setStep('create-password')}
          onBack={() => setStep('initial')}
        />
      )}

      {step === 'create-password' && (
        <SecureWalletStep
          onSave={() => handleSaveWallet(mnemonic, false)}
          onBack={() => {
            setStep('create-seed')
            resetPasswordFields()
          }}
        />
      )}

      {step === 'import-method' && (
        <ImportWalletStep
          mode="method"
          onSelectMethod={(method) => {
            setImportMethod(method)
            setStep('import-input')
          }}
          onContinue={() => setStep('import-input')}
          onBackToInitial={() => setStep('initial')}
          onBackToMethod={() => setStep('import-method')}
        />
      )}

      {step === 'import-input' && (
        <ImportWalletStep
          mode="input"
          onSelectMethod={setImportMethod}
          onContinue={() => {
            if (!inputValue.trim()) return
            setStep('import-password')
          }}
          onBackToInitial={() => setStep('initial')}
          onBackToMethod={() => {
            setStep('import-method')
            setInputValue('')
          }}
        />
      )}

      {step === 'import-password' && (
        <SecureWalletStep
          onSave={() => handleSaveWallet(inputValue, importMethod === 'privateKey')}
          onBack={() => {
            setStep('import-input')
            resetPasswordFields()
          }}
        />
      )}
    </OnboardingShell>
  )
}
