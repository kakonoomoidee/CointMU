import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Plus icon used for add and create actions.
 * @param props - Standard icon props.
 * @returns The rendered plus icon.
 */
function IconPlus(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </BaseIcon>
  )
}

export { IconPlus }
