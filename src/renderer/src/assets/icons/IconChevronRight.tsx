import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Chevron right icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconChevronRight(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="9 18 15 12 9 6" />
    </BaseIcon>
  )
}

export { IconChevronRight }
