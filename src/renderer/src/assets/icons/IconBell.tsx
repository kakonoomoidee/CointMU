import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Bell icon used for the notification center trigger.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconBell(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </BaseIcon>
  )
}

export { IconBell }
