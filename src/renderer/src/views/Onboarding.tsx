import { useState, type JSX } from 'react'
import { generateMnemonic, deriveAccount } from '@/services'

interface OnboardingProps {
  onComplete: (address: string) => void
}

/**
 * Clean, centered onboarding view presented to new users before the main
 * application shell renders. Allows generation of a new wallet or importing
 * an existing one.
 * @param props Contains the onComplete callback to update the parent state.
 * @returns The Onboarding screen component.
 */
export function Onboarding({ onComplete }: OnboardingProps): JSX.Element {
  const [step, setStep] = useState<1 | 2>(1)
  const [mnemonic, setMnemonic] = useState<string>('')

  const handleCreateWallet = (): void => {
    const phrase = generateMnemonic()
    setMnemonic(phrase)
    setStep(2)
  }

  const handleConfirmSeed = async (): Promise<void> => {
    // Derive the first account (index 0)
    const firstAccount = deriveAccount(mnemonic, 0, 'Main wallet')
    
    // Persist to the main process store
    await window.api.settings.set('mnemonic', mnemonic)
    await window.api.settings.set('accounts', [firstAccount])
    await window.api.settings.set('activeWalletAddress', firstAccount.address)
    
    // Notify parent to reveal the main application shell
    onComplete(firstAccount.address)
  }

  const handleImportWallet = (): void => {
    // Left empty for future implementation
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md mb-8">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {step === 1 ? 'Welcome to CointMU' : 'Secret Recovery Phrase'}
        </h1>
        <p className="text-center text-sm font-medium text-slate-500 mb-8 leading-relaxed">
          {step === 1 
            ? 'The decentralized, gasless, and zero-storage WebRTC P2P protocol client.'
            : 'Write down these 12 words in order. Never share them with anyone. They are the only way to recover your wallet.'}
        </p>

        {step === 1 ? (
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleCreateWallet}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Create New Wallet
            </button>
            <button
              onClick={handleImportWallet}
              className="w-full py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              Import Wallet
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {mnemonic.split(' ').map((word, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white rounded shadow-sm border border-slate-100">
                  <span className="text-xs text-slate-400 font-mono select-none w-4">{index + 1}.</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">{word}</span>
                </div>
              ))}
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

            <button
              onClick={handleConfirmSeed}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm mt-2"
            >
              I have saved these words safely
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
