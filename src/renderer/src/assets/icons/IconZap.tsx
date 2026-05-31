import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Lightning bolt icon used to represent difficulty and energy.
 * @param props - Standard icon props.
 * @returns The rendered zap icon.
 */
function IconZap(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </BaseIcon>
  )
}

export { IconZap }
