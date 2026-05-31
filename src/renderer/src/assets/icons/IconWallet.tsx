import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Wallet or credit card icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconWallet(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M22 10H2" />
    </BaseIcon>
  )
}

export { IconWallet }
