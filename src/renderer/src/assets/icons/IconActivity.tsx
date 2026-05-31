import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Pulse/activity icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconActivity(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </BaseIcon>
  )
}

export { IconActivity }
