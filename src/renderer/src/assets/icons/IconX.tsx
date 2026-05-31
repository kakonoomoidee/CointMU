import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Cross icon used for close and dismiss actions.
 * @param props - Standard icon props.
 * @returns The rendered cross icon.
 */
function IconX(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </BaseIcon>
  )
}

export { IconX }
