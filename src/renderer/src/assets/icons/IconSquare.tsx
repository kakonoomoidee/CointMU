import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Rounded square icon used as a generic block placeholder.
 * @param props - Standard icon props.
 * @returns The rendered square icon.
 */
function IconSquare(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </BaseIcon>
  )
}

export { IconSquare }
