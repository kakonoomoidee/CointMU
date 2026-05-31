import { useState, useEffect, type JSX } from 'react'
import { useNetworkStats, useBalance, useRecentBlocks } from '@/hooks'
import {
  formatBlockNumber,
  formatHashrate,
  formatDifficulty,
  computeMinedBlocksCount
} from '@/utils'
import { DashboardHeader } from './DashboardHeader'
import { WalletOverviewCard } from './WalletOverviewCard'
import { NetworkHealthPanel } from './NetworkHealthPanel'
import { DashboardStatsGrid } from './DashboardStatsGrid'
import { LatestBlocks } from './LatestBlocks'
import { ActivityFeed } from './ActivityFeed'

const DASHBOARD_TICK_INTERVAL_MS = 5000

interface DashboardProps {
  activeWalletAddress: string | null
}

/**
 * Primary dashboard view orchestrator. It sources live network, balance, and
 * recent-block state from dedicated hooks, derives the formatted display values,
 * and composes the layout from focused presentational sub-components.
 * @param props - The active wallet address.
 * @returns The complete dashboard layout.
 */
function Dashboard({ activeWalletAddress }: DashboardProps): JSX.Element {
  const networkStats = useNetworkStats()
  const { balance } = useBalance(activeWalletAddress, networkStats.isConnected)
  const recentBlocks = useRecentBlocks(networkStats.blockHeight, networkStats.isConnected)

  const [, setCurrentTime] = useState<number>(Date.now())
  useEffect(() => {
    const tickInterval = setInterval(() => setCurrentTime(Date.now()), DASHBOARD_TICK_INTERVAL_MS)
    return () => clearInterval(tickInterval)
  }, [])

  const isConnected = networkStats.isConnected

  const minedBlocksCount = isConnected ? computeMinedBlocksCount(balance) : 0
  const hashrateDisplay = isConnected ? formatHashrate(networkStats.hashrate) : '0.00 H/s'
  const miningUptimeLabel =
    isConnected && networkStats.isMining ? 'Actively mining' : 'Miner idle'

  const difficultyDisplay = isConnected ? formatDifficulty(networkStats.difficulty) : '--'
  const gasDisplay =
    isConnected && networkStats.gasPriceGwei !== null ? networkStats.gasPriceGwei : '0'
  const blockDisplay = isConnected ? formatBlockNumber(networkStats.blockHeight) : '--'
  const peerDisplay =
    isConnected && networkStats.peerCount !== null ? String(networkStats.peerCount) : '--'

  const abbrAddress = activeWalletAddress
    ? `${activeWalletAddress.substring(0, 6)}...${activeWalletAddress.substring(activeWalletAddress.length - 4)}`
    : '--'

  if (networkStats.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50/80 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Connecting to local node...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <DashboardHeader isConnected={isConnected} />

      <main className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
        <div className="grid grid-cols-[1.35fr_1fr] gap-5">
          <WalletOverviewCard
            balance={balance}
            abbrAddress={abbrAddress}
            activeWalletAddress={activeWalletAddress}
          />
          <NetworkHealthPanel
            isConnected={isConnected}
            blockDisplay={blockDisplay}
            peerDisplay={peerDisplay}
            difficultyDisplay={difficultyDisplay}
            gasDisplay={gasDisplay}
            blocksPastHour={recentBlocks.length}
          />
        </div>

        <DashboardStatsGrid
          isConnected={isConnected}
          miningLabel={hashrateDisplay}
          miningUptimeLabel={miningUptimeLabel}
          minedBlocksCount={minedBlocksCount}
          hashrateDisplay={hashrateDisplay}
        />

        <div className="grid grid-cols-2 gap-5 min-h-0">
          <LatestBlocks
            isConnected={isConnected}
            recentBlocks={recentBlocks}
            activeWalletAddress={activeWalletAddress}
          />
          <ActivityFeed
            isConnected={isConnected}
            recentBlocks={recentBlocks}
            activeWalletAddress={activeWalletAddress}
            abbrAddress={abbrAddress}
          />
        </div>
      </main>
    </div>
  )
}

export { Dashboard }
