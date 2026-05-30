import { useState, useEffect, type JSX } from 'react'
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

interface OnboardingProps {
  onComplete: (address: string) => void
}

type OnboardingStep = 
  | 'initial'
  | 'login'
  | 'create-seed'
  | 'create-password'
  | 'import-method'
  | 'import-input'
  | 'import-password'

type ImportMethod = 'seed' | 'privateKey'

/**
 * Enterprise-grade secure onboarding flow for CointMU Desktop. Handles
 * multi-step wallet generation, recovery via seed or private key, and
 * mocked local encryption flows before revealing the main dashboard.
 * @param props Contains the onComplete callback to update the parent state.
 * @returns The Onboarding screen component.
 */
export function Onboarding({ onComplete }: OnboardingProps): JSX.Element {
  const [step, setStep] = useState<OnboardingStep>('initial')
  const [hasExistingWallet, setHasExistingWallet] = useState<boolean>(false)

  const [mnemonic, setMnemonic] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)

  const [importMethod, setImportMethod] = useState<ImportMethod>('seed')
  const [inputValue, setInputValue] = useState<string>('')

  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkExisting(): Promise<void> {
      const encrypted = await getSetting<string | null>('encryptedPayload')
      if (encrypted) {
        setHasExistingWallet(true)
      }
    }
    checkExisting()
  }, [])

  const handleCopySeed = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(mnemonic)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore copy errors
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
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      let firstAccount
      if (isPrivateKey) {
        firstAccount = deriveAccountFromPrivateKey(secretKey, 'Main wallet')
      } else {
        firstAccount = deriveAccount(secretKey, 0, 'Main wallet')
      }

      // Encrypt the secret with a scrypt-derived key + AES-GCM in the main process.
      const encryptedPayload = await encryptSecret(secretKey, password)

      await setSetting('encryptedPayload', encryptedPayload)
      await setSetting('accounts', [firstAccount])
      await setSetting('activeWalletAddress', firstAccount.address)

      unlockSession(password)
      onComplete(firstAccount.address)
    } catch {
      setError('Failed to generate account from the provided credentials')
    }
  }

  const renderInitial = (): JSX.Element => (
    <div className="w-full flex flex-col gap-4">
      {hasExistingWallet && (
        <button
          onClick={() => setStep('login')}
          className="w-full py-3.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm"
        >
          Login
        </button>
      )}
      <button
        onClick={handleStartCreate}
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
      >
        Create New Wallet
      </button>
      <button
        onClick={handleStartImport}
        className="w-full py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
      >
        Import Wallet
      </button>
    </div>
  )

  const renderLogin = (): JSX.Element => (
    <div className="w-full flex flex-col gap-5">
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Enter Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setStep('initial')
            setPassword('')
            setError(null)
          }}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleLogin}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Unlock
        </button>
      </div>
    </div>
  )

  const renderCreateSeed = (): JSX.Element => (
    <div className="w-full flex flex-col gap-6">
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {mnemonic.split(' ').map((word, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white rounded shadow-sm border border-slate-100">
              <span className="text-xs text-slate-400 font-mono select-none w-4">{index + 1}.</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{word}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleCopySeed}
          className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 items-start">
        <svg className="text-amber-500 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-xs text-amber-800 font-medium">
          Do not save this digitally or take a screenshot. Store it completely offline in a safe place.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('initial')}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('create-password')}
          className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          I have saved these words
        </button>
      </div>
    </div>
  )

  const renderPasswordCreation = (secretKey: string, isPrivateKey: boolean): JSX.Element => (
    <div className="w-full flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setError(null)
            }}
            className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => {
            setStep(step === 'create-password' ? 'create-seed' : 'import-input')
            setPassword('')
            setConfirmPassword('')
            setError(null)
          }}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => handleSaveWallet(secretKey, isPrivateKey)}
          disabled={!password || password.length < 8 || password !== confirmPassword}
          className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Encrypt & Save
        </button>
      </div>
    </div>
  )

  const renderImportMethod = (): JSX.Element => (
    <div className="w-full flex flex-col gap-4">
      <button
        onClick={() => {
          setImportMethod('seed')
          setStep('import-input')
        }}
        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M4 15h6" />
              <path d="M4 18h6" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">12-word Seed Phrase</p>
            <p className="text-[10px] text-slate-500">Standard BIP39 mnemonic</p>
          </div>
        </div>
        <svg className="text-slate-300 group-hover:text-blue-500 transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button
        onClick={() => {
          setImportMethod('privateKey')
          setStep('import-input')
        }}
        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">Private Key</p>
            <p className="text-[10px] text-slate-500">Raw hex string (0x...)</p>
          </div>
        </div>
        <svg className="text-slate-300 group-hover:text-blue-500 transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button
        onClick={() => setStep('initial')}
        className="w-full mt-2 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
      >
        Back
      </button>
    </div>
  )

  const renderImportInput = (): JSX.Element => (
    <div className="w-full flex flex-col gap-5">
      {importMethod === 'seed' ? (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Seed Phrase</label>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            rows={4}
            placeholder="apple banana cherry..."
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Private Key</label>
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="0x..."
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            setStep('import-method')
            setInputValue('')
          }}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (!inputValue.trim()) return
            setStep('import-password')
          }}
          disabled={!inputValue.trim()}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )

  const getTitle = (): string => {
    switch (step) {
      case 'initial': return 'Welcome to CointMU'
      case 'login': return 'Welcome Back'
      case 'create-seed': return 'Secret Recovery Phrase'
      case 'create-password': return 'Create a Password'
      case 'import-method': return 'Import Wallet'
      case 'import-input': return importMethod === 'seed' ? 'Enter Seed Phrase' : 'Enter Private Key'
      case 'import-password': return 'Create a Password'
      default: return ''
    }
  }

  const getSubtitle = (): string => {
    switch (step) {
      case 'initial': return 'The decentralized, gasless, and zero-storage WebRTC P2P protocol client.'
      case 'login': return 'Unlock your encrypted wallet to continue.'
      case 'create-seed': return 'Write down these 12 words in order. Never share them with anyone.'
      case 'create-password':
      case 'import-password': return 'This password encrypts your private keys locally on this device.'
      case 'import-method': return 'Select how you want to recover your existing wallet.'
      case 'import-input': return importMethod === 'seed' ? 'Paste your 12-word seed phrase.' : 'Paste your raw hex private key.'
      default: return ''
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md mb-8">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">
          {getTitle()}
        </h1>
        <p className="text-center text-sm font-medium text-slate-500 mb-8 leading-relaxed">
          {getSubtitle()}
        </p>

        {step === 'initial' && renderInitial()}
        {step === 'login' && renderLogin()}
        {step === 'create-seed' && renderCreateSeed()}
        {step === 'create-password' && renderPasswordCreation(mnemonic, false)}
        {step === 'import-method' && renderImportMethod()}
        {step === 'import-input' && renderImportInput()}
        {step === 'import-password' && renderPasswordCreation(inputValue, importMethod === 'privateKey')}
      </div>
    </div>
  )
}
