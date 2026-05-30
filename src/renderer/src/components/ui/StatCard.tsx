import { type JSX, type ReactNode } from 'react'
import { cn } from '@/utils'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  valueClassName?: string
  className?: string
}

/**
 * KPI tile presenting a labelled metric with an optional icon, trailing action,
 * primary value, and supporting hint. Wraps the shared Card surface.
 * @param props - Label, value, and optional hint, icon, action, and styling.
 * @returns The rendered stat card.
 */
function StatCard({
  label,
  value,
  hint,
  icon,
  action,
  valueClassName,
  className
}: StatCardProps): JSX.Element {
  return (
    <Card padding="sm" className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            {label}
          </span>
        </div>
        {action}
      </div>
      <p className={cn('text-2xl font-bold text-slate-800 tracking-tight', valueClassName)}>
        {value}
      </p>
      {hint !== undefined && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </Card>
  )
}

export { StatCard }
export type { StatCardProps }
