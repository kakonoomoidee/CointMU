import { FOUND_BLOCKS_PAGE_SIZE } from "../mining.constants";
import { useState, useMemo, type JSX } from "react";
import {
  useRecentBlocks,
  useMiningStats,
  useMiningControls,
  useMiningActivity,
  useTimer,
  usePagination,
} from "@/hooks";
import { useMiningStore, useAppStore, type FoundBlock } from "@/store";
import { type DerivedAccount } from "@/services";
import {
  formatMhs,
  isWithinLastDay,
  getSafeConcurrency,
  formatRewards,
  formatDifficultyLabel,
  resolveHistoryAddresses,
  filterFoundBlocks,
} from "@/utils";
import { IconAlertCircle } from "@/assets/icons";
import { MiningHeader } from "./mining-header.component";
import { MiningHeroCard } from "./mining-hero-card.component";
import { MiningStatsGrid } from "./mining-stats-grid.component";
import { WorkerConfiguration } from "./worker-configuration.component";
import {
  MiningActivity,
  ACTIVITY_TAB_FOUND,
} from "./mining-activity.component";
import { SkeletonCard, SkeletonList, Skeleton } from "@/components";

interface MinerProps {
  activeWalletAddress: string | null;
  accounts: DerivedAccount[];
  onNavigate: (view: string, payload?: string) => void;
}

/**
 * Mining controller view orchestrator. All telemetry, control, timer, and
 * activity state is sourced from dedicated hooks, derived values are computed via
 * pure utilities, and the UI is composed from focused presentational
 * sub-components. The view contains no IPC or business-effect logic of its own.
 * @param props - The active wallet address.
 * @returns The complete mining view with header, hero, KPI grid, and panels.
 */
function MiningView({ accounts, onNavigate }: MinerProps): JSX.Element {
  const [maxCores] = useState<number>(getSafeConcurrency());
  const [activeTab, setActiveTab] = useState<string>(ACTIVITY_TAB_FOUND);

  const blockHeight = useAppStore((s) => s.blockHeight);
  const isConnected = useAppStore((s) => s.isConnected);
  const loading = useAppStore((s) => s.loading);
  const balance = useAppStore((s) => s.balance);
  const historyFilter = useAppStore((s) => s.historyFilter);
  const setHistoryFilter = useAppStore((s) => s.setHistoryFilter);
  const recentBlocks = useRecentBlocks(blockHeight, isConnected);

  const ownedAddresses = useMemo(
    () => accounts.map((account) => account.address),
    [accounts],
  );

  const historyAddresses = useMemo(
    () => resolveHistoryAddresses(historyFilter, accounts),
    [historyFilter, accounts],
  );

  const { config, toggling, error, toggle } = useMiningControls();
  const telemetry = useMiningStats(config.cpuThreads);
  const {
    sessionStartTime,
    startMining,
    stopMining,
    foundBlocks,
    hashrateHistory,
  } = useMiningStore();

  const isMining = telemetry.isMining;
  const elapsedTime = useTimer(sessionStartTime, isMining);

  useMiningActivity(recentBlocks, ownedAddresses);

  const scopedFoundBlocks = filterFoundBlocks<FoundBlock>(
    foundBlocks,
    historyAddresses,
  );
  const foundBlocksPagination = usePagination(
    scopedFoundBlocks,
    FOUND_BLOCKS_PAGE_SIZE,
  );

  /**
   * Toggles the node miner while making the user's explicit start/stop the
   * authoritative driver of the session clock. Starting stamps the session
   * start time, stopping clears it, and only then is the node toggled.
   * @param enabled - Whether mining should be turned on.
   * @returns A promise that resolves once the node toggle completes.
   */
  const handleToggle = async (enabled: boolean): Promise<void> => {
    if (enabled) startMining();
    else stopMining();
    await toggle(enabled);
  };

  const rewardAddress = config.poolAddress || "";
  const hashrateLabel = formatMhs(telemetry.hashrateMhs);
  const formattedRewards = formatRewards(balance);
  const blocksFoundToday = useMemo(
    () =>
      scopedFoundBlocks.filter((block) => isWithinLastDay(block.timestamp))
        .length,
    [scopedFoundBlocks],
  );
  const difficultyLabel = formatDifficultyLabel(telemetry.difficulty);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50/80">
        <MiningHeader
          isMining={false}
          powerStatus="offline"
          onNavigate={onNavigate}
        />
        <main className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
          <Skeleton className="rounded-3xl bg-white border border-slate-200 h-64 w-full" />
          <div className="grid grid-cols-4 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-[1fr_1.2fr] gap-5">
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <Skeleton className="w-48 h-6 mb-6" />
              <Skeleton className="w-full h-12 mb-4" />
              <Skeleton className="w-full h-12 mb-4" />
              <Skeleton className="w-full h-12" />
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-4">
                <Skeleton className="w-24 h-8 rounded-lg" />
                <Skeleton className="w-24 h-8 rounded-lg" />
              </div>
              <SkeletonList itemCount={5} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <MiningHeader
        isMining={isMining}
        powerStatus={telemetry.powerStatus}
        onNavigate={onNavigate}
      />

      <main className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
        <MiningHeroCard
          isMining={isMining}
          isGeneratingDag={telemetry.isGeneratingDag}
          dagProgress={telemetry.dagProgress}
          isConnected={isConnected}
          cpuThreads={config.cpuThreads}
          hashrateLabel={hashrateLabel}
          formattedRewards={formattedRewards}
          difficultyLabel={difficultyLabel}
          toggling={toggling}
          isSyncing={telemetry.isSyncing}
          onToggle={handleToggle}
        />

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
            <IconAlertCircle
              className="text-red-500 flex-shrink-0"
              width={16}
              height={16}
            />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <MiningStatsGrid
          elapsedTime={elapsedTime}
          isMining={isMining}
          blocksFoundToday={blocksFoundToday}
          balance={balance}
          hashrateLabel={hashrateLabel}
          hashrateHistory={hashrateHistory}
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
            minedBlocks={foundBlocksPagination.pageItems}
            scopedFoundBlocks={scopedFoundBlocks}
            currentPage={foundBlocksPagination.currentPage}
            totalPages={foundBlocksPagination.totalPages}
            onPageChange={foundBlocksPagination.setPage}
            accounts={accounts}
            historyFilter={historyFilter}
            onFilterChange={setHistoryFilter}
          />
        </div>
      </main>
    </div>
  );
}

export { MiningView };
