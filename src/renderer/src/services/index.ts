export {
  createProvider,
  resetProvider,
  getBlockNumber,
  getChainId,
  getPeerCount,
  getSyncStatus,
  startMining,
  stopMining,
  getMiningStatus,
  getHashrate
} from './web3Provider'

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
