import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Arrow pointing up icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconArrowUp(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="17 11 12 6 7 11" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </BaseIcon>
  )
}

export { IconArrowUp }
