import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Stacked layers icon used as the application and mining brand mark.
 * @param props - Standard icon props.
 * @returns The rendered layers icon.
 */
function IconLayers(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </BaseIcon>
  )
}

export { IconLayers }
