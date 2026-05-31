import { type JSX } from 'react'
import { useOnboardingStore } from '@/store'

interface CreateWalletStepProps {
  onCopySeed: () => void
  onContinue: () => void
  onBack: () => void
}

/**
 * Wallet creation step displaying the generated 12-word recovery phrase with a
 * copy control and an offline-storage warning. The mnemonic and copied flag are
 * read from the onboarding store.
 * @param props - The copy, continue, and back navigation handlers.
 * @returns The rendered create wallet step.
 */
function CreateWalletStep({ onCopySeed, onContinue, onBack }: CreateWalletStepProps): JSX.Element {
  const mnemonic = useOnboardingStore((s) => s.mnemonic)
  const copied = useOnboardingStore((s) => s.copied)

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {mnemonic.split(' ').map((word, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded shadow-sm border border-slate-100"
            >
              <span className="text-xs text-slate-400 font-mono select-none w-4">{index + 1}.</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{word}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onCopySeed}
          className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 items-start">
        <svg
          className="text-amber-500 shrink-0 mt-0.5"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-xs text-amber-800 font-medium">
          Do not save this digitally or take a screenshot. Store it completely offline in a safe
          place.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          I have saved these words
        </button>
      </div>
    </div>
  )
}

export { CreateWalletStep }
export type { CreateWalletStepProps }
