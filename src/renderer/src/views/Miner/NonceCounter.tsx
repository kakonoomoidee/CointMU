import { type JSX } from 'react'
import { useMiningStore } from '@/store'

/**
 * Isolated component that renders the live nonce counter and progress bar.
 * Relies strictly on the global Zustand store which safely persists the nonce lifecycle.
 * @returns The rendered nonce counter element.
 */
function NonceCounter(): JSX.Element {
  const nonce = useMiningStore((s) => s.nonce)
  const candidate = useMiningStore((s) => s.candidate)
  
  const displayCandidate = candidate ?? '--'
  const displayNonces = Math.floor(nonce).toLocaleString()

  return (
    <div className="mt-4 mb-3">
      <p className="text-[11px] text-emerald-100/80 font-mono mb-2 tracking-wide font-medium">
        Solving candidate #{displayCandidate.toLocaleString()} - {displayNonces} nonces tried
      </p>
      <div className="w-full h-1.5 rounded-full bg-emerald-950/50 overflow-hidden relative">
        <div className="h-full rounded-full bg-emerald-400 animate-[fillBar_2s_linear_infinite]" />
      </div>
    </div>
  )
}

export { NonceCounter }
