import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Image icon used to represent appearance and media settings.
 * @param props - Standard icon props.
 * @returns The rendered image icon.
 */
function IconImage(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </BaseIcon>
  )
}

export { IconImage }
