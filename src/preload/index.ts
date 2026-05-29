import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { readFileSync } from 'fs'
import { join } from 'path'

const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'))

let platformStr = ''
if (process.platform === 'darwin') {
  platformStr = process.arch === 'arm64' ? 'Apple silicon' : 'Intel Mac'
} else if (process.platform === 'win32') {
  platformStr = `Windows ${process.arch}`
} else {
  platformStr = `Linux ${process.arch}`
}

let buildNum = 0
try {
  const buildData = JSON.parse(readFileSync(join(__dirname, '../../build-info.json'), 'utf-8'))
  if (typeof buildData.build === 'number') {
    buildNum = buildData.build
  }
} catch (e) {
  buildNum = 0
}

const systemInfo = {
  version: pkg.version,
  build: buildNum,
  platform: platformStr,
  nodeVersion: process.versions.node,
  getUptime: () => process.uptime()
}

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
  },
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateStatus: (callback: (payload: { status: string; percent?: number }) => void) => {
      const handler = (_: any, payload: { status: string; percent?: number }): void => {
        callback(payload)
      }
      ipcRenderer.on('update-status', handler)
      return () => ipcRenderer.removeListener('update-status', handler)
    }
  },
  mining: {
    toggle: (enabled: boolean) => ipcRenderer.invoke('mining:toggle', enabled),
    setThreads: (cores: number) => ipcRenderer.invoke('mining:setThreads', cores),
    setPoolAddress: (address: string) => ipcRenderer.invoke('mining:setPoolAddress', address),
    onMiningStatusChanged: (callback: (status: string) => void) => {
      const handler = (_: any, status: string): void => {
        callback(status)
      }
      ipcRenderer.on('mining:status-changed', handler)
      return () => ipcRenderer.removeListener('mining:status-changed', handler)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('systemInfo', systemInfo)
  } catch {
    console.error('Failed to expose context bridge APIs')
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
  // @ts-ignore
  window.systemInfo = systemInfo
}
