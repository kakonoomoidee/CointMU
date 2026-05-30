import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Cube icon used to represent blocks and on-chain data.
 * @param props - Standard icon props.
 * @returns The rendered cube icon.
 */
function IconCube(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </BaseIcon>
  )
}

export { IconCube }
