import { type JSX } from 'react'
import { generateIdenticonGradient } from '@/services'
import { IconCopy } from '@/assets/icons'

interface AddressBadgeProps {
  address: string | null
  leftAligned?: boolean
  onClick?: (address: string) => void
}

/**
 * Compact address chip rendering an identicon swatch alongside the abbreviated
 * address, with a contract-creation fallback when no address is present. When an
 * onClick handler is supplied the address navigates, and the copy control writes
 * the full address to the clipboard.
 * @param props - The address to render, an optional left-alignment flag, and an
 *        optional navigation handler.
 * @returns The rendered address badge.
 */
function AddressBadge({ address, leftAligned = false, onClick }: AddressBadgeProps): JSX.Element {
  if (!address) {
    return <span className="text-sm text-slate-400 font-mono">0x0 (Contract Creation)</span>
  }

  const display = `${address.substring(0, 10)}...${address.substring(address.length - 8)}`

  /**
   * Copies the full address to the clipboard without triggering navigation.
   * @returns Nothing.
   */
  const handleCopy = (): void => {
    navigator.clipboard.writeText(address)
  }

  return (
    <div className={`flex items-center gap-1.5 ${leftAligned ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`w-4 h-4 rounded-full flex-shrink-0 bg-gradient-to-br ${generateIdenticonGradient(address)}`}
      />
      <span
        className="text-sm font-mono text-blue-600 cursor-pointer hover:underline"
        title={address}
        onClick={onClick ? () => onClick(address) : undefined}
      >
        {display}
      </span>
      <IconCopy
        className="text-slate-300 ml-0.5 cursor-pointer hover:text-slate-500"
        width={12}
        height={12}
        onClick={handleCopy}
      />
    </div>
  )
}

export { AddressBadge }
export type { AddressBadgeProps }
