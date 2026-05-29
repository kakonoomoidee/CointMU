import { ElectronAPI } from '@electron-toolkit/preload'

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
