import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Document icon with text lines used to represent seed phrases and files.
 * @param props - Standard icon props.
 * @returns The rendered file-text icon.
 */
function IconFileText(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M4 15h6" />
      <path d="M4 18h6" />
    </BaseIcon>
  )
}

export { IconFileText }
