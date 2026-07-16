import { type JSX } from 'react'
import { cn } from '@/utils'

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

interface StatusPillProps {
  tone?: StatusTone
  label: string
  pulse?: boolean
  showDot?: boolean
  className?: string
}

const BASE_CLASSES = 'inline-flex items-center gap-2 px-4 py-2 rounded-full border'

const CONTAINER_TONE: Record<StatusTone, string> = {
  success: 'border-emerald-200 bg-emerald-50',
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-red-200 bg-red-50',
  neutral: 'border-slate-200 bg-slate-50'
}

const TEXT_TONE: Record<StatusTone, string> = {
  success: 'text-emerald-600',
  warning: 'text-amber-700',
  danger: 'text-red-600',
  neutral: 'text-slate-500'
}

const DOT_TONE: Record<StatusTone, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-400',
  neutral: 'bg-slate-400'
}

/**
 * Header status indicator combining a colored dot and a label inside a rounded
 * pill, used to surface connection and mining state.
 * @param props - Tone, label text, and optional pulse and dot visibility flags.
 * @returns The rendered status pill element.
 */
function StatusPill({
  tone = 'neutral',
  label,
  pulse = false,
  showDot = true,
  className
}: StatusPillProps): JSX.Element {
  return (
    <div className={cn(BASE_CLASSES, CONTAINER_TONE[tone], className)}>
      {showDot && (
        <span className={cn('w-2 h-2 rounded-full', DOT_TONE[tone], pulse && 'animate-pulse')} />
      )}
      <span className={cn('text-xs font-semibold', TEXT_TONE[tone])}>{label}</span>
    </div>
  )
}

export { StatusPill }
export type { StatusPillProps, StatusTone }
