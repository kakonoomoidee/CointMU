import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Lock icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconLock(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </BaseIcon>
  )
}

export { IconLock }
