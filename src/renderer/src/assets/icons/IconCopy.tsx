import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Copy to clipboard icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconCopy(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </BaseIcon>
  )
}

export { IconCopy }
