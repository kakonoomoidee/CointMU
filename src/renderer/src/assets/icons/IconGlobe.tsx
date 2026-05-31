import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Globe icon.
 * @param props - Standard icon props.
 * @returns The rendered icon.
 */
function IconGlobe(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </BaseIcon>
  )
}

export { IconGlobe }
