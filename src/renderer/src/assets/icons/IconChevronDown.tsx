import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Chevron down icon used for select and disclosure controls.
 * @param props - Standard icon props.
 * @returns The rendered chevron down icon.
 */
function IconChevronDown(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="6 9 12 15 18 9" />
    </BaseIcon>
  )
}

export { IconChevronDown }
