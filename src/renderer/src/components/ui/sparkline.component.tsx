import { type JSX, useId } from 'react'

interface SparklineProps {
  data: number[]
  className?: string
  color?: string
  strokeWidth?: number
}

/**
 * A reusable sparkline component rendering a dynamic inline SVG area chart.
 * @param props - Data points and styling options.
 * @returns The rendered sparkline SVG.
 */
function Sparkline({ data, className = '', color = 'currentColor', strokeWidth = 1.5 }: SparklineProps): JSX.Element {
  const gradientId = useId()

  if (!data || data.length === 0) {
    return <svg className={className} viewBox="0 0 100 20" preserveAspectRatio="none" />
  }

  let max = Math.max(...data)
  let min = Math.min(...data)
  
  if (max === min) {
    if (max === 0) {
      max = 1
      min = 0
    } else {
      min = 0
      max = max * 2 // Force line to 50% vertical height
    }
  }
  const range = max - min
  
  const width = 100
  const height = 20
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * width
    const y = height - ((value - min) / range) * (height - strokeWidth) - (strokeWidth / 2)
    return { x, y }
  })

  // Smooth bezier curve generator for a sleek aesthetic
  let pathD = `M ${points[0].x},${points[0].y}`
  if (points.length > 1) {
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2
      pathD += ` C ${xMid},${points[i].y} ${xMid},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`
    }
  }

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`

  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      <path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export { Sparkline }
