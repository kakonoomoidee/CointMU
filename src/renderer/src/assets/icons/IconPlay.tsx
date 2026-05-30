import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Filled play triangle icon used for start actions.
 * @param props - Standard icon props.
 * @returns The rendered play icon.
 */
function IconPlay(props: IconProps): JSX.Element {
  return (
    <BaseIcon filled {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </BaseIcon>
  )
}

export { IconPlay }
