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
  getCpuUsage: (): Promise<number> => ipcRenderer.invoke('get-cpu-usage'),
  getNodeStatus: (): Promise<{
    running: boolean
    port: number
    sessionValid: boolean
    networkId: string
  }> => ipcRenderer.invoke('get-node-status'),
  network: {
    getInsights: () => ipcRenderer.invoke('network:getInsights'),
    getGenesisConfig: () => ipcRenderer.invoke('network:getGenesisConfig'),
    setChainId: (chainId: number) => ipcRenderer.invoke('network:setChainId', chainId)
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll')
  },
  wallet: {
    encrypt: (secret: string, password: string): Promise<string> =>
      ipcRenderer.invoke('wallet:encrypt', secret, password),
    decrypt: (payload: string, password: string): Promise<string> =>
      ipcRenderer.invoke('wallet:decrypt', payload, password),
    verify: (payload: string, password: string): Promise<boolean> =>
      ipcRenderer.invoke('wallet:verify', payload, password),
    getActivity: (addresses: string[]): Promise<any[]> =>
      ipcRenderer.invoke('wallet:getActivity', addresses)
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
    getStats: () => ipcRenderer.invoke('mining:getStats'),
    onDagProgress: (callback: (progress: number) => void) => {
      const handler = (_event: any, value: number): void => {
        callback(value)
      }
      ipcRenderer.on('mining:dagProgress', handler)
      return () => ipcRenderer.removeListener('mining:dagProgress', handler)
    },
    onMiningStatusChanged: (callback: (status: string) => void) => {
      const handler = (_: any, status: string): void => {
        callback(status)
      }
      ipcRenderer.on('mining:status-changed', handler)
      return () => ipcRenderer.removeListener('mining:status-changed', handler)
    },
    onMiningLog: (callback: (log: unknown) => void) => {
      const handler = (_event: any, log: unknown): void => {
        callback(log)
      }
      ipcRenderer.on('mining:log-event', handler)
      return () => ipcRenderer.removeListener('mining:log-event', handler)
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
