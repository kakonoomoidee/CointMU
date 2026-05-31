import { useState, useEffect, type JSX } from 'react'
import {
  useNetworkStats,
  useRecentBlocks,
  useMiningStats,
  useMiningControls,
  useMiningActivity,
  useTimer
} from '@/hooks'
import { useMiningStore } from '@/store'
import {
  formatMhs,
  isWithinLastDay,
  getSafeConcurrency,
  computeSharesData,
  formatRewards,
  formatDifficultyLabel
} from '@/utils'
import { IconAlertCircle } from '@/assets/icons'
import { MiningHeader } from './MiningHeader'
import { MiningHeroCard } from './MiningHeroCard'
import { MiningStatsGrid } from './MiningStatsGrid'
import { WorkerConfiguration } from './WorkerConfiguration'
import { MiningActivity, ACTIVITY_TAB_FOUND } from './MiningActivity'

interface MinerProps {
  activeWalletAddress: string | null
  balance: string
}

const SHARES_WINDOW_SIZE = 60

/**
 * Mining controller view orchestrator. All telemetry, control, timer, and
 * activity state is sourced from dedicated hooks, derived values are computed via
 * pure utilities, and the UI is composed from focused presentational
 * sub-components. The view contains no IPC or business-effect logic of its own.
 * @param props - The active wallet address and current wallet balance.
 * @returns The complete mining view with header, hero, KPI grid, and panels.
 */
function Miner({ activeWalletAddress, balance }: MinerProps): JSX.Element {
  const [maxCores] = useState<number>(getSafeConcurrency())
  const [activeTab, setActiveTab] = useState<string>(ACTIVITY_TAB_FOUND)

  const networkStats = useNetworkStats()
  const isConnected = networkStats.isConnected
  const recentBlocks = useRecentBlocks(networkStats.blockHeight, isConnected)

  const { config, toggling, error, toggle } = useMiningControls()
  const telemetry = useMiningStats(config.cpuThreads)
  const { startTime, toggleMining, foundBlocks } = useMiningStore()

  const isMining = telemetry.isMining
  const elapsedTime = useTimer(startTime, isMining)

  const { logs, noncesTried } = useMiningActivity(
    recentBlocks,
    activeWalletAddress,
    isMining,
    telemetry.hashrateMhs
  )

  useEffect(() => {
    toggleMining(isMining)
  }, [isMining, toggleMining])

  const rewardAddress = config.poolAddress || activeWalletAddress || ''
  const hashrateLabel = formatMhs(telemetry.hashrateMhs)
  const formattedRewards = formatRewards(balance)
  const blocksFoundToday = foundBlocks.filter((block) => isWithinLastDay(block.timestamp)).length

  const nextBlock = (telemetry.blockNumber || networkStats.blockHeight || 0) + 1
  const difficultyLabel = formatDifficultyLabel(telemetry.difficulty)

  const sharesData = computeSharesData(recentBlocks, SHARES_WINDOW_SIZE, activeWalletAddress)
  const acceptedShares = sharesData.filter((share) => share === true).length
  const networkShares = sharesData.filter((share) => share === false).length

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <MiningHeader isMining={isMining} powerStatus={telemetry.powerStatus} />

      <main className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
        <MiningHeroCard
          isMining={isMining}
          isGeneratingDag={telemetry.isGeneratingDag}
          dagProgress={telemetry.dagProgress}
          isMiningEnabled={config.isMiningEnabled}
          cpuThreads={config.cpuThreads}
          hashrateLabel={hashrateLabel}
          formattedRewards={formattedRewards}
          difficultyLabel={difficultyLabel}
          nextBlock={nextBlock}
          noncesTried={noncesTried}
          toggling={toggling}
          onToggle={toggle}
        />

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
            <IconAlertCircle className="text-red-500 flex-shrink-0" width={16} height={16} />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <MiningStatsGrid
          elapsedTime={elapsedTime}
          isMining={isMining}
          blocksFoundToday={blocksFoundToday}
          balance={balance}
          hashrateLabel={hashrateLabel}
        />

        <div className="grid grid-cols-[1fr_1.2fr] gap-5">
          <WorkerConfiguration
            cpuThreads={config.cpuThreads}
            maxCores={maxCores}
            intensity={config.intensity}
            rewardAddress={rewardAddress}
          />

          <MiningActivity
            activeTab={activeTab}
            onTabChange={setActiveTab}
            minedBlocks={foundBlocks}
            sharesData={sharesData}
            acceptedShares={acceptedShares}
            networkShares={networkShares}
            logs={logs}
          />
        </div>
      </main>
    </div>
  )
}

export { Miner }
