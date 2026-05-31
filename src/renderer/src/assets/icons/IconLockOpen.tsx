import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Open padlock icon used for unlock and sign-out actions.
 * @param props - Standard icon props.
 * @returns The rendered open lock icon.
 */
function IconLockOpen(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0" />
    </BaseIcon>
  )
}

export { IconLockOpen }
