import { ElectronAPI } from '@electron-toolkit/preload'

interface CointmuAPI {
  getRpcPort: () => Promise<number>
  getNodeStatus: () => Promise<{
    running: boolean
    port: number
    sessionValid: boolean
    networkId: string
  }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CointmuAPI
  }
}
