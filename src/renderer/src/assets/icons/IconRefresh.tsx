import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Circular refresh icon used for retry and regenerate actions.
 * @param props - Standard icon props.
 * @returns The rendered refresh icon.
 */
function IconRefresh(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </BaseIcon>
  )
}

export { IconRefresh }
