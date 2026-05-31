import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * File icon with a folded corner used to represent documents and transactions.
 * @param props - Standard icon props.
 * @returns The rendered file icon.
 */
function IconFile(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </BaseIcon>
  )
}

export { IconFile }
