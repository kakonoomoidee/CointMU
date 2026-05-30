import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Circled cross icon used for error and alert states.
 * @param props - Standard icon props.
 * @returns The rendered alert icon.
 */
function IconAlertCircle(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </BaseIcon>
  )
}

export { IconAlertCircle }
