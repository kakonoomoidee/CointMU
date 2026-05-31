import { type JSX } from 'react'
import { Badge, StatCard } from '@/components'

interface MiningStatsGridProps {
  elapsedTime: string
  isMining: boolean
  blocksFoundToday: number
  balance: string
  hashrateLabel: string
}

/**
 * Static SVG sparkline reflecting whether the miner is active, used as the hint
 * for the hashrate stat card.
 * @param props - Whether mining is currently active.
 * @returns The rendered sparkline span.
 */
function HashrateSparkline({ isMining }: { isMining: boolean }): JSX.Element {
  return (
    <span className="block mt-2 h-10">
      <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
        {isMining ? (
          <path
            d="M0,30 L10,28 L20,25 L30,27 L40,22 L50,20 L60,24 L70,18 L80,22 L90,16 L100,20 L110,14 L120,18 L130,12 L140,16 L150,10 L160,14 L170,8 L180,12 L190,10 L200,8"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M0,35 L10,35 L20,34 L30,35 L40,35 L50,34 L60,35 L70,35 L80,34 L90,35 L100,35 L110,34 L120,35 L130,35 L140,34 L150,35 L160,35 L170,34 L180,35 L190,35 L200,35"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  )
}

/**
 * Four-column KPI grid summarizing the mining session: elapsed time, blocks
 * found today, total earned, and the recent hashrate with a sparkline.
 * @param props - Session time, mining flag, block count, balance, and hashrate.
 * @returns The rendered stats grid.
 */
function MiningStatsGrid({
  elapsedTime,
  isMining,
  blocksFoundToday,
  balance,
  hashrateLabel
}: MiningStatsGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-5">
      <StatCard
        label="Session Time"
        value={elapsedTime}
        hint={isMining ? 'Active' : 'Idle'}
        valueClassName="font-mono"
      />
      <StatCard label="Blocks Found" value={blocksFoundToday} hint="past 24 hours" />
      <StatCard
        label="Total Earned"
        value={
          <>
            +{balance}
            <span className="text-sm font-medium text-slate-400 ml-1.5">CMU</span>
          </>
        }
        hint="across this wallet"
        valueClassName="text-emerald-600"
      />
      <StatCard
        label="Hashrate - 5 min"
        action={<Badge tone={isMining ? 'success' : 'neutral'}>{isMining ? 'Stable' : 'Idle'}</Badge>}
        value={isMining ? `${hashrateLabel} MH/s` : '0.00 MH/s'}
        valueClassName="font-mono"
        hint={<HashrateSparkline isMining={isMining} />}
      />
    </div>
  )
}

export { MiningStatsGrid }
export type { MiningStatsGridProps }
