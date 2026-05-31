import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Grid or blocks icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconGrid(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </BaseIcon>
  )
}

export { IconGrid }
