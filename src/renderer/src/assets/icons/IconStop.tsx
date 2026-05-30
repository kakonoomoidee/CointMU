import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Filled stop square icon used for halt actions.
 * @param props - Standard icon props.
 * @returns The rendered stop icon.
 */
function IconStop(props: IconProps): JSX.Element {
  return (
    <BaseIcon filled {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </BaseIcon>
  )
}

export { IconStop }
