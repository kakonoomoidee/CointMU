import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getRpcPort: (): Promise<number> => ipcRenderer.invoke('get-rpc-port'),
  getNodeStatus: (): Promise<{
    running: boolean
    port: number
    sessionValid: boolean
    networkId: string
  }> => ipcRenderer.invoke('get-node-status'),
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll')
  }
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
