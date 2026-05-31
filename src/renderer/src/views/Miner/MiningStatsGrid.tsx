import { type JSX } from 'react'
import { Badge, StatCard, Sparkline } from '@/components'

interface MiningStatsGridProps {
  elapsedTime: string
  isMining: boolean
  blocksFoundToday: number
  balance: string
  hashrateLabel: string
  hashrateHistory: number[]
}

/**
 * Four-column KPI grid summarizing the mining session: elapsed time, blocks
 * found today, total earned, and the recent hashrate with a sparkline.
 * @param props - Session time, mining flag, block count, balance, hashrate, and
 * the recent hashrate history feeding the sparkline.
 * @returns The rendered stats grid.
 */
function MiningStatsGrid({
  elapsedTime,
  isMining,
  blocksFoundToday,
  balance,
  hashrateLabel,
  hashrateHistory
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
        hint={
          <span className="block mt-2 h-10">
            <Sparkline
              data={hashrateHistory}
              className="w-full h-full"
              color={isMining ? '#10b981' : '#cbd5e1'}
            />
          </span>
        }
      />
    </div>
  )
}

export { MiningStatsGrid }
export type { MiningStatsGridProps }
