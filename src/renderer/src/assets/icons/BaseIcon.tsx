import { type JSX, type ReactNode } from 'react'
import { type IconProps } from './types'

const DEFAULT_ICON_SIZE = 24
const DEFAULT_ICON_COLOR = 'currentColor'
const DEFAULT_STROKE_WIDTH = 2

interface BaseIconProps extends IconProps {
  children: ReactNode
  filled?: boolean
}

/**
 * Shared SVG wrapper that provides a consistent 24x24 viewBox, stroke styling,
 * and dimension overrides for every icon in the centralized icon library.
 * @param props - Icon dimensions, color, fill mode, and child path elements.
 * @returns A configured SVG element wrapping the supplied path children.
 */
function BaseIcon({
  width = DEFAULT_ICON_SIZE,
  height = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  filled = false,
  children,
  ...rest
}: BaseIconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth={DEFAULT_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  )
}

export { BaseIcon }
