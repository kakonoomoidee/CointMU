import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Eye icon representing visible or revealed content.
 * @param props - Standard icon props.
 * @returns The rendered eye icon.
 */
function IconEye(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  )
}

export { IconEye }
