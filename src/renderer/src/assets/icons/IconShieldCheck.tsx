import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Shield check icon used for security settings.
 * @param props - Standard icon props.
 * @returns The rendered shield check icon.
 */
function IconShieldCheck(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </BaseIcon>
  )
}

export { IconShieldCheck }
