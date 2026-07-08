import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Trash icon used for deletion or removal actions.
 * @param props - Standard icon props.
 * @returns The rendered trash icon.
 */
function IconTrash(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </BaseIcon>
  )
}

export { IconTrash }
