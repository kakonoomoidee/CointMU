import { ElectronAPI } from '@electron-toolkit/preload'

interface UpdateStatusPayload {
  status: string
  percent?: number
}

interface CointmuAPI {
  getRpcPort: () => Promise<number>
  getNodeStatus: () => Promise<{
    running: boolean
    port: number
    sessionValid: boolean
    networkId: string
  }>
  settings: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
    getAll: () => Promise<any>
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
    onMiningStatusChanged: (callback: (status: string) => void) => () => void
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
