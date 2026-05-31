import { type JSX } from 'react'

interface SparklineProps {
  data: number[]
  className?: string
  color?: string
  strokeWidth?: number
}

/**
 * A reusable sparkline component rendering a dynamic inline SVG chart.
 * @param props - Data points and styling options.
 * @returns The rendered sparkline SVG.
 */
function Sparkline({ data, className = '', color = 'currentColor', strokeWidth = 2 }: SparklineProps): JSX.Element {
  if (!data || data.length === 0) {
    return <svg className={className} viewBox="0 0 100 20" preserveAspectRatio="none" />
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max === min ? (max === 0 ? 1 : max) : max - min
  
  const width = 100
  const height = 20
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * width
    const y = height - ((value - min) / range) * (height - strokeWidth) - (strokeWidth / 2)
    return `${x},${y}`
  })

  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" fill="none">
      <path
        d={`M ${points.join(' L ')}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { Sparkline }
