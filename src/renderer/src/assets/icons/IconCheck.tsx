import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Checkmark icon used for success and confirmation states.
 * @param props - Standard icon props.
 * @returns The rendered checkmark icon.
 */
function IconCheck(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="20 6 9 17 4 12" />
    </BaseIcon>
  )
}

export { IconCheck }
