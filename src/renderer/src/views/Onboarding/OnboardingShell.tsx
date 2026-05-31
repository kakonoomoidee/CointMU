import { type JSX, type ReactNode } from 'react'
import { type OnboardingStep, type ImportMethod } from '@/store'

interface OnboardingShellProps {
  step: OnboardingStep
  importMethod: ImportMethod
  children: ReactNode
}

interface StepCopy {
  title: string
  subtitle: string
}

/**
 * Resolves the title and subtitle copy for the current onboarding step.
 * @param step - The active onboarding step.
 * @param importMethod - The selected import method, used to vary import copy.
 * @returns The title and subtitle strings for the step.
 */
function getStepCopy(step: OnboardingStep, importMethod: ImportMethod): StepCopy {
  switch (step) {
    case 'initial':
      return {
        title: 'Welcome to CointMU',
        subtitle: 'The decentralized, gasless, and zero-storage WebRTC P2P protocol client.'
      }
    case 'login':
      return { title: 'Welcome Back', subtitle: 'Unlock your encrypted wallet to continue.' }
    case 'create-seed':
      return {
        title: 'Secret Recovery Phrase',
        subtitle: 'Write down these 12 words in order. Never share them with anyone.'
      }
    case 'create-password':
    case 'import-password':
      return {
        title: 'Create a Password',
        subtitle: 'This password encrypts your private keys locally on this device.'
      }
    case 'import-method':
      return {
        title: 'Import Wallet',
        subtitle: 'Select how you want to recover your existing wallet.'
      }
    case 'import-input':
      return {
        title: importMethod === 'seed' ? 'Enter Seed Phrase' : 'Enter Private Key',
        subtitle:
          importMethod === 'seed'
            ? 'Paste your 12-word seed phrase.'
            : 'Paste your raw hex private key.'
      }
    default:
      return { title: '', subtitle: '' }
  }
}

/**
 * Outer presentational shell for the onboarding wizard. Renders the centered
 * card, brand logo, and step-aware title and subtitle, then renders the active
 * step as its children.
 * @param props - The current step, import method, and the active step content.
 * @returns The rendered onboarding shell.
 */
function OnboardingShell({ step, importMethod, children }: OnboardingShellProps): JSX.Element {
  const { title, subtitle } = getStepCopy(step, importMethod)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md mb-8">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">{title}</h1>
        <p className="text-center text-sm font-medium text-slate-500 mb-8 leading-relaxed">
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  )
}

export { OnboardingShell, getStepCopy }
export type { OnboardingShellProps, StepCopy }
