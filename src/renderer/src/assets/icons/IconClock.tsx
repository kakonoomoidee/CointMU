import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Clock icon used to represent time and recency.
 * @param props - Standard icon props.
 * @returns The rendered clock icon.
 */
function IconClock(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </BaseIcon>
  )
}

export { IconClock }
