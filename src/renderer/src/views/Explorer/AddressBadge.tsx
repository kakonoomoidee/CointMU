import { type JSX } from 'react'
import { generateIdenticonGradient } from '@/services'
import { IconCopy } from '@/assets/icons'

interface AddressBadgeProps {
  address: string | null
  leftAligned?: boolean
}

/**
 * Compact address chip rendering an identicon swatch alongside the abbreviated
 * address, with a contract-creation fallback when no address is present.
 * @param props - The address to render and an optional left-alignment flag.
 * @returns The rendered address badge.
 */
function AddressBadge({ address, leftAligned = false }: AddressBadgeProps): JSX.Element {
  if (!address) {
    return (
      <span className="text-sm text-slate-400 font-mono">0x0 (Contract Creation)</span>
    )
  }

  const display = `${address.substring(0, 10)}...${address.substring(address.length - 8)}`

  return (
    <div
      className={`flex items-center gap-1.5 ${leftAligned ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className="w-4 h-4 rounded-full flex-shrink-0"
        style={{ background: generateIdenticonGradient(address) }}
      />
      <span
        className="text-sm font-mono text-blue-600 cursor-pointer hover:underline"
        title={address}
      >
        {display}
      </span>
      <IconCopy
        className="text-slate-300 ml-0.5 cursor-pointer hover:text-slate-500"
        width={12}
        height={12}
      />
    </div>
  )
}

export { AddressBadge }
export type { AddressBadgeProps }
