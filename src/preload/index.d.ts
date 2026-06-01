import { ElectronAPI } from '@electron-toolkit/preload'

interface UpdateStatusPayload {
  status: string
  percent?: number
}

interface CointmuAPI {
  getRpcPort: () => Promise<number>
  getCpuUsage: () => Promise<number>
  getNodeStatus: () => Promise<{
    running: boolean
    port: number
    sessionValid: boolean
    networkId: string
  }>
  network: {
    getInsights: () => Promise<{
      isOnline: boolean
      height: number
      blockTime: number
      transactions: number
      activeAddresses: number
      difficulty: number
      blocks: {
        number: number
        hash: string
        miner: string
        timestamp: number
        txCount: number
      }[]
      coinbase: string
    }>
    getGenesisConfig: () => Promise<{ config?: { chainId?: number } } | null>
    setChainId: (chainId: number) => Promise<boolean>
  }
  settings: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
    getAll: () => Promise<any>
  }
  wallet: {
    encrypt: (secret: string, password: string) => Promise<string>
    decrypt: (payload: string, password: string) => Promise<string>
    verify: (payload: string, password: string) => Promise<boolean>
    getActivity: (addresses: string[]) => Promise<{id: string, type: 'mining' | 'send' | 'receive' | 'contract', title: string, subtitle: string, amount: string, timestamp: number, timestampStr: string, blockNumber?: number, hash?: string, from?: string, to?: string}[]>
  }
  updater: {
    checkForUpdates: () => Promise<void>
    quitAndInstall: () => Promise<void>
    onUpdateStatus: (callback: (payload: UpdateStatusPayload) => void) => () => void
  }
  mining: {
    toggle: (enabled: boolean) => Promise<void>
    setThreads: (cores: number) => Promise<void>
    setPoolAddress: (address: string) => Promise<void>
    getStats: () => Promise<{isMining: boolean; hashrate: number; difficulty: number; blockNumber: number}>
    onDagProgress: (callback: (progress: number) => void) => () => void
    onMiningStatusChanged: (callback: (status: string) => void) => () => void
    onMiningLog: (
      callback: (log: {
        id: string
        timestamp: string
        level: 'INFO' | 'OK' | 'WARN' | 'ERROR'
        message: string
      }) => void
    ) => () => void
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CointmuAPI
    systemInfo?: {
      version: string
      build: number
      platform: string
      nodeVersion: string
      getUptime: () => number
    }
  }
}
