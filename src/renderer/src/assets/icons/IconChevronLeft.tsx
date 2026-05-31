import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Chevron left icon used for back navigation.
 * @param props - Standard icon props.
 * @returns The rendered chevron left icon.
 */
function IconChevronLeft(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="15 18 9 12 15 6" />
    </BaseIcon>
  )
}

export { IconChevronLeft }
