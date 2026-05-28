import { type SVGProps } from 'react'

const DEFAULT_ICON_SIZE = 24
const DEFAULT_ICON_COLOR = 'currentColor'

interface IconProps extends SVGProps<SVGSVGElement> {
  width?: number | string
  height?: number | string
  color?: string
}

/**
 * Customizable eye-slash SVG icon component.
 * Accepts full override of dimensions, color, and native SVG attributes.
 * @param props - Unified icon props with width, height, color, and SVG spread attributes.
 * @returns A rendered SVG element representing an eye with a slash through it.
 */
function IconEyeSlash({
  width = DEFAULT_ICON_SIZE,
  height = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  ...rest
}: IconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export { IconEyeSlash }
export type { IconProps }
