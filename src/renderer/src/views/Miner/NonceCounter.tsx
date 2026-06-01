import { useState, useEffect, type JSX } from 'react'
import { useMiningStore } from '@/store'

/**
 * Isolated component that renders the live nonce counter and progress bar.
 * Computes a high-frequency local visual interpolation of the nonce to guarantee
 * smooth real-time ticking between the discrete telemetry polling intervals,
 * snapping back to the global ground truth from the Zustand store.
 * @returns The rendered nonce counter element.
 */
function NonceCounter(): JSX.Element {
  const nonce = useMiningStore((s) => s.nonce)
  const candidate = useMiningStore((s) => s.candidate)
  const hashrateMhs = useMiningStore((s) => s.hashrateMhs)
  const isMining = useMiningStore((s) => s.sessionStartTime !== null)
  
  const [visualNonce, setVisualNonce] = useState<number>(nonce)

  useEffect(() => {
    setVisualNonce(nonce)
  }, [nonce])

  useEffect(() => {
    if (!isMining || hashrateMhs <= 0) {
      return
    }

    const TICK_INTERVAL_MS = 33
    const hashesPerTick = (hashrateMhs * 1_000_000) * (TICK_INTERVAL_MS / 1000)

    const tickId = setInterval(() => {
      setVisualNonce((prev) => prev + hashesPerTick)
    }, TICK_INTERVAL_MS)

    return (): void => clearInterval(tickId)
  }, [isMining, hashrateMhs])

  const displayCandidate = candidate ?? '--'
  const displayNonces = Math.floor(visualNonce).toLocaleString()

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
