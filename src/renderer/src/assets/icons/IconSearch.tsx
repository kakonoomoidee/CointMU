import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Magnifying glass icon used for search inputs and actions.
 * @param props - Standard icon props.
 * @returns The rendered search icon.
 */
function IconSearch(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </BaseIcon>
  )
}

export { IconSearch }
