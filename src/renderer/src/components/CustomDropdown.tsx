import { type JSX, useState, useRef, useEffect } from 'react'
import { IconChevronDown } from '@/assets/icons'

/**
 * Props for the CustomDropdown component.
 * @template T - The type of the options array items.
 */
interface CustomDropdownProps<T> {
  options: T[]
  selected: T | null
  onSelect: (option: T) => void
  renderSelected: (selected: T | null) => React.ReactNode
  renderOption: (option: T) => React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * A reusable, generic dropdown component that manages its own open/close state
 * and close-on-click-outside behavior. Allows full customization of how the
 * selected item and option list items are rendered.
 * @param props - The configuration props including options and render functions.
 * @returns The rendered custom dropdown component.
 */
export function CustomDropdown<T>({
  options,
  selected,
  onSelect,
  renderSelected,
  renderOption,
  disabled = false,
  className = ''
}: CustomDropdownProps<T>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className || 'w-full'}`} ref={dropdownRef}>
      <button
        type='button'
        onClick={() => setIsOpen((v) => !v)}
        disabled={disabled}
        className='w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:bg-white hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <div className='flex items-center gap-2'>{renderSelected(selected)}</div>
        <IconChevronDown
          width={16}
          height={16}
          className={`text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden'>
          {options.map((option, idx) => (
            <button
              type='button'
              key={idx}
              onClick={() => {
                onSelect(option)
                setIsOpen(false)
              }}
              className='w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors'
            >
              {renderOption(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
