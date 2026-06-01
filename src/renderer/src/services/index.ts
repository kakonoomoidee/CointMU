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
  generateIdenticonGradient,
  encryptSecret,
  decryptSecret,
  verifyPassword,
  revealPrivateKey
} from './walletService'
export type { DerivedAccount } from './walletService'

export { unlockSession, getSessionPassword, lockSession } from './walletSession'

export { getSetting, setSetting, getAllSettings } from './settingsService'

export {
  getMiningConfig,
  setMiningEnabled,
  toggleMiner,
  setThreads,
  setPoolAddress,
  fetchMiningStats,
  subscribeMiningStatus,
  subscribeDagProgress,
  subscribeMiningLog
} from './miningService'
export type { MiningStats, MiningConfig } from './miningService'

export { getNetworkInsights } from './networkService'
export type { NetworkInsights, NetworkInsightBlock } from './networkService'

export { checkForUpdates, downloadUpdate, installUpdate } from './updaterService'

export { getCpuUsage } from './systemService'

export { detectSearchType, getTransactionDetail, getAddressSummary } from './explorerService'
export type { SearchType, TransactionDetailData, AddressSummary } from './explorerService'
