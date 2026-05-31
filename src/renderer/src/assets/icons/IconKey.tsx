import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Key icon used to represent private keys and credential imports.
 * @param props - Standard icon props.
 * @returns The rendered key icon.
 */
function IconKey(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </BaseIcon>
  )
}

export { IconKey }
