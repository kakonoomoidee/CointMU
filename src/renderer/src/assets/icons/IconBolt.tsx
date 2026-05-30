import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Lightning bolt icon used to represent hashrate and mining power.
 * @param props - Standard icon props.
 * @returns The rendered bolt icon.
 */
function IconBolt(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </BaseIcon>
  )
}

export { IconBolt }
