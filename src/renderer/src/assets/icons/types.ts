import { type SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  width?: number | string
  height?: number | string
  color?: string
}

export type { IconProps }
