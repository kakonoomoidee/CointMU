import { type ButtonHTMLAttributes, type JSX, type ReactNode } from 'react'
import { cn } from '@/utils'

type ButtonVariant = 'primary' | 'danger' | 'success' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'bg-white/15 backdrop-blur-sm text-white hover:bg-white/25'
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-6 py-3 text-sm'
}

/**
 * Reusable pill button supporting semantic color variants, sizes, and an
 * optional leading icon. Presentational only; all behavior is delegated to the
 * native button element through spread props.
 * @param props - Button props including variant, size, and leftIcon.
 * @returns The rendered button element.
 */
function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  className,
  children,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  )
}

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
