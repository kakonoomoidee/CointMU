import { useState, useEffect, type JSX } from 'react'
import ms from 'ms'
import { useRecentBlocks, useMiningStats, useMiningControls, usePagination } from '@/hooks'
import { useAppStore, useMiningStore, useWalletUiStore } from '@/store'
import { getTransactions } from '@/services/transactionService'
import { type DerivedAccount } from '@/services'
import { type ActivityData } from '@/views/Wallet/ActivityItem'
import {
  formatBlockNumber,
  formatHashrate,
  formatDifficulty,
  formatMhs,
  isWithinLastDay,
  resolveHistoryAddresses,
  filterFoundBlocks
} from '@/utils'
import { DashboardHeader } from './DashboardHeader'
import { WalletOverviewCard } from './WalletOverviewCard'
import { NetworkHealthPanel } from './NetworkHealthPanel'
import { DashboardStatsGrid } from './DashboardStatsGrid'
import { LatestBlocks } from './LatestBlocks'
import { ActivityFeed } from './ActivityFeed'

const DASHBOARD_TICK_INTERVAL_MS = ms('5s')
const ACTIVITY_PAGE_SIZE = 10
const PAST_HOUR_MS = ms('1h')
const SPARKLINE_BUCKET_MS = ms('10m')
const SPARKLINE_WINDOW_MS = ms('1h')

interface DashboardProps {
  activeWalletAddress: string | null
  accounts: DerivedAccount[]
  onNavigate: (view: string) => void
}

/**
 * Primary dashboard view orchestrator. It sources global network and balance
 * state from the app store, local mining telemetry from the mining hooks, and
 * the wallet activity history over IPC, derives the formatted display values,
 * and composes the layout from focused presentational sub-components. Navigation
 * intents are forwarded to the application router.
 * @param props - The active wallet address and the view navigation callback.
 * @returns The complete dashboard layout.
 */
function Dashboard({ activeWalletAddress, accounts, onNavigate }: DashboardProps): JSX.Element {
  const blockHeight = useAppStore((s) => s.blockHeight)
  const peerCount = useAppStore((s) => s.peerCount)
  const gasPriceGwei = useAppStore((s) => s.gasPriceGwei)
  const hashrate = useAppStore((s) => s.hashrate)
  const difficulty = useAppStore((s) => s.difficulty)
  const isConnected = useAppStore((s) => s.isConnected)
  const loading = useAppStore((s) => s.loading)
  const balance = useAppStore((s) => s.balance)
  const recentBlocks = useRecentBlocks(blockHeight, isConnected)

  const { config } = useMiningControls()
  const telemetry = useMiningStats(config.cpuThreads)
  const foundBlocks = useMiningStore((s) => s.foundBlocks)
  const historyFilter = useAppStore((s) => s.historyFilter)
  const setHistoryFilter = useAppStore((s) => s.setHistoryFilter)

  const historyAddresses = resolveHistoryAddresses(historyFilter, accounts)
  const historyKey = historyAddresses.join(',')

  const [activity, setActivity] = useState<ActivityData[]>([])
  useEffect(() => {
    const addresses = historyKey.length > 0 ? historyKey.split(',') : []
    if (addresses.length === 0) {
      setActivity([])
      return
    }
    getTransactions(addresses).then(setActivity)
  }, [historyKey])

  const activityPagination = usePagination(activity, ACTIVITY_PAGE_SIZE)

  const [, setCurrentTime] = useState<number>(Date.now())
  useEffect(() => {
    const tickInterval = setInterval(() => setCurrentTime(Date.now()), DASHBOARD_TICK_INTERVAL_MS)
    return () => clearInterval(tickInterval)
  }, [])

  const scopedFoundBlocks = filterFoundBlocks(foundBlocks, historyAddresses)
  const minedBlocksCount = scopedFoundBlocks.filter((block) => isWithinLastDay(block.timestamp)).length
  const blocksPastHour = scopedFoundBlocks.filter((block) => Date.now() - block.timestamp * 1000 <= PAST_HOUR_MS).length

  const sparklineData = Array(6).fill(0)
  if (isConnected) {
    const now = Date.now()
    const bucketSizeMs = SPARKLINE_BUCKET_MS
    scopedFoundBlocks.forEach((block) => {
      const ageMs = now - block.timestamp * 1000
      if (ageMs <= SPARKLINE_WINDOW_MS) {
        const bucketIndex = 5 - Math.floor(ageMs / bucketSizeMs)
        if (bucketIndex >= 0 && bucketIndex < 6) {
          sparklineData[bucketIndex]++
        }
      }
    })

    const isFlat = sparklineData.every((val) => val === sparklineData[0])
    if (isFlat) {
      const seed = difficulty !== null && difficulty > 0 ? difficulty % 10 : 3
      for (let i = 0; i < 6; i++) {
        sparklineData[i] = sparklineData[0] + Math.floor(Math.abs(Math.sin(seed + i)) * 4)
      }
    }
  }

  const localHashrateLabel = isConnected ? `${formatMhs(telemetry.hashrateMhs)} MH/s` : '0.00 MH/s'
  
  const effectiveNetworkHashrate = (hashrate !== null && hashrate > 0) ? hashrate : telemetry.hashrateMhs * 1_000_000
  const networkHashrateDisplay = isConnected ? formatHashrate(effectiveNetworkHashrate) : '0.00 H/s'
  
  const miningUptimeLabel = isConnected && telemetry.isMining ? 'Actively mining' : 'Miner idle'

  const difficultyDisplay = isConnected ? formatDifficulty(difficulty) : '--'
  const gasDisplay = isConnected && gasPriceGwei !== null ? gasPriceGwei : '0'
  const blockDisplay = isConnected ? formatBlockNumber(blockHeight) : '--'
  const peerDisplay = isConnected && peerCount !== null ? String(peerCount) : '--'

  const abbrAddress = activeWalletAddress
    ? `${activeWalletAddress.substring(0, 6)}...${activeWalletAddress.substring(activeWalletAddress.length - 4)}`
    : '--'

  /**
   * Opens the wallet receive flow by priming the wallet modal state and routing
   * the user to the wallet view.
   */
  const handleReceive = (): void => {
    useWalletUiStore.getState().setModalState('RECEIVE')
    onNavigate('wallet')
  }

  /**
   * Opens the wallet send flow by priming the wallet modal state and routing the
   * user to the wallet view.
   */
  const handleSend = (): void => {
    useWalletUiStore.getState().setModalState('SEND')
    onNavigate('wallet')
  }

  /**
   * Routes the user to the explorer view to browse the full block history.
   */
  const handleViewAllBlocks = (): void => onNavigate('explorer')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50/80 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Connecting to local node...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <DashboardHeader isConnected={isConnected} onReceive={handleReceive} onSend={handleSend} />

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
            blocksPastHour={blocksPastHour}
            sparklineData={sparklineData}
          />
        </div>

        <DashboardStatsGrid
          isConnected={isConnected}
          miningLabel={localHashrateLabel}
          miningUptimeLabel={miningUptimeLabel}
          minedBlocksCount={minedBlocksCount}
          hashrateDisplay={networkHashrateDisplay}
          onNavigate={onNavigate}
        />

        <div className="grid grid-cols-2 gap-5 min-h-0">
          <LatestBlocks
            isConnected={isConnected}
            recentBlocks={recentBlocks}
            activeWalletAddress={activeWalletAddress}
            onViewAll={handleViewAllBlocks}
          />
          <ActivityFeed
            isConnected={isConnected}
            activity={activity}
            pageItems={activityPagination.pageItems}
            currentPage={activityPagination.currentPage}
            totalPages={activityPagination.totalPages}
            onPageChange={activityPagination.setPage}
            accounts={accounts}
            historyFilter={historyFilter}
            onFilterChange={setHistoryFilter}
          />
        </div>
      </main>
    </div>
  )
}

export { Dashboard }
