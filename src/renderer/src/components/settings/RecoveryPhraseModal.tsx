import { useEffect, useRef, useState, type FormEvent, type JSX } from 'react'
import {
  IconKey,
  IconEye,
  IconEyeSlash,
  IconCopy,
  IconCheck,
  IconAlertTriangle,
  IconX
} from '@/assets/icons'
import { revealRecoveryPhrase } from '@/services'

interface RecoveryPhraseModalProps {
  onClose: () => void
}

const AUTO_HIDE_SECONDS = 30

/**
 * Password-gated modal that decrypts and displays the wallet's 12-word recovery
 * phrase. The phrase is held in component state, auto-hidden after a timer, and
 * scrubbed on unmount. As with the private key modal, scrubbing clears the
 * references rather than zeroing memory, which is the strongest guarantee
 * achievable in the renderer.
 * @param props - The close handler that dismisses the modal.
 * @returns The rendered recovery-phrase modal.
 */
export function RecoveryPhraseModal({ onClose }: RecoveryPhraseModalProps): JSX.Element {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phrase, setPhrase] = useState('')
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(AUTO_HIDE_SECONDS)

  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (autoHideRef.current) clearTimeout(autoHideRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const clearTimers = (): void => {
    if (autoHideRef.current) {
      clearTimeout(autoHideRef.current)
      autoHideRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }

  const scrub = (): void => {
    clearTimers()
    setPhrase('')
    setPassword('')
    setCopied(false)
    setError('')
    setSecondsLeft(AUTO_HIDE_SECONDS)
  }

  const handleClose = (): void => {
    scrub()
    onClose()
  }

  const startAutoHide = (): void => {
    setSecondsLeft(AUTO_HIDE_SECONDS)
    autoHideRef.current = setTimeout(() => {
      handleClose()
    }, AUTO_HIDE_SECONDS * 1000)
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
  }

  const handleReveal = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setError('')
    if (!password) {
      setError('Enter your password.')
      return
    }
    setLoading(true)
    try {
      const result = await revealRecoveryPhrase(password)
      setPhrase(result)
      startAutoHide()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reveal recovery phrase.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(phrase)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard.')
    }
  }

  const isRevealed = phrase.length > 0
  const words = isRevealed ? phrase.split(' ') : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <IconX width={20} height={20} strokeWidth={2.5} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <IconKey width={20} height={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Recovery phrase</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Your 12-word seed phrase restores full access to this wallet.
          </p>

          <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <IconAlertTriangle width={18} height={18} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed font-medium">
              Never share your recovery phrase. Anyone who has it can take full control of your
              wallet and steal all of your funds. Store it offline and never type it into a website.
            </p>
          </div>

          {!isRevealed ? (
            <form onSubmit={handleReveal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter your wallet password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <IconEyeSlash width={18} height={18} />
                    ) : (
                      <IconEye width={18} height={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Reveal recovery phrase'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {words.map((word, index) => (
                  <div
                    key={`${index}-${word}`}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <span className="text-[10px] font-mono text-slate-400 w-4 text-right">{index + 1}</span>
                    <span className="text-sm font-mono font-semibold text-slate-800">{word}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <IconCheck width={16} height={16} strokeWidth={2.5} />
                ) : (
                  <IconCopy width={16} height={16} strokeWidth={2.5} />
                )}
                {copied ? 'Copied to clipboard' : 'Copy to clipboard'}
              </button>

              <p className="text-center text-xs text-slate-400">
                This phrase will be hidden automatically in {secondsLeft}s.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
