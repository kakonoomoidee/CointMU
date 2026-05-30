export {
  call,
  fetchBlockNumber,
  fetchPeerCount,
  fetchGasPrice,
  fetchMiningStatus,
  fetchHashrate,
  fetchDifficulty,
  fetchBalance,
  setEtherbase,
  startMiner,
  stopMiner
} from './rpcClient'

export {
  generateMnemonic,
  deriveAccount,
  deriveAccountFromPrivateKey,
  generateIdenticonGradient
} from './walletService'
export type { DerivedAccount } from './walletService'

export { getSetting, setSetting, getAllSettings } from './settingsService'

export {
  getMiningConfig,
  setMiningEnabled,
  toggleMiner,
  setThreads,
  setPoolAddress,
  fetchMiningStats,
  subscribeMiningStatus,
  subscribeDagProgress
} from './miningService'
export type { MiningStats, MiningConfig } from './miningService'

export { getNetworkInsights } from './networkService'
export type { NetworkInsights, NetworkInsightBlock } from './networkService'

export { checkForUpdates, quitAndInstall } from './updaterService'
