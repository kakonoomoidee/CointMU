import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getRpcPort: (): Promise<number> => ipcRenderer.invoke('get-rpc-port'),
  getNodeStatus: (): Promise<{
    running: boolean
    port: number
    sessionValid: boolean
    networkId: string
  }> => ipcRenderer.invoke('get-node-status')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch {
    console.error('Failed to expose context bridge APIs')
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
