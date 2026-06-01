import { type JSX } from 'react'
import { cn } from '@/utils'
import { IconChevronDown } from '@/assets/icons'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
  ariaLabel?: string
}

const BASE_CLASSES =
  'appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer'

/**
 * Compact styled wrapper around a native select element. Rendering through the
 * native control keeps keyboard and accessibility behavior intact while matching
 * the application visual language, with a trailing chevron affordance.
 * @param props - The current value, option list, change handler, and styling.
 * @returns The rendered select control.
 */
function Select({ value, options, onChange, className, ariaLabel }: SelectProps): JSX.Element {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={BASE_CLASSES}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <IconChevronDown
        width={12}
        height={12}
        className="pointer-events-none absolute right-2.5 text-slate-400"
      />
    </div>
  )
}

export { Select }
export type { SelectProps, SelectOption }
