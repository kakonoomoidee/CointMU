import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Arrow pointing down icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconArrowDown(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="7 13 12 18 17 13" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </BaseIcon>
  )
}

export { IconArrowDown }
