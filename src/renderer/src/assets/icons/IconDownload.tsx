import { type JSX } from 'react'
import { BaseIcon } from './BaseIcon'
import { type IconProps } from './types'

/**
 * Download icon used for import and download actions.
 * @param props - Standard icon props.
 * @returns The rendered download icon.
 */
function IconDownload(props: IconProps): JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </BaseIcon>
  )
}

export { IconDownload }
