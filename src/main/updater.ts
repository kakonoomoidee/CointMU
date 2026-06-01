import { app, ipcMain, type BrowserWindow } from 'electron'
import { autoUpdater, type UpdateInfo, type ProgressInfo } from 'electron-updater'

/**
 * Structured update lifecycle payload forwarded to the renderer over the
 * 'updater:state' channel. Only the fields relevant to the current status are
 * populated so the renderer can normalize them into its reactive state.
 */
interface UpdaterStatePayload {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  info?: { version: string }
  progress?: { percent: number; transferred: number; total: number; bytesPerSecond: number }
  error?: string
}

/**
 * Initializes the Electron auto-updater in manual-download mode and wires its
 * lifecycle events and renderer-facing IPC handlers. autoDownload is disabled so
 * the user explicitly triggers the download after an update has been found.
 * @param mainWindow - The main BrowserWindow used to forward update events.
 * @returns {void}
 */
function initUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = false
  autoUpdater.logger = console

  const send = (payload: UpdaterStatePayload): void => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater:state', payload)
    }
  }

  autoUpdater.on('checking-for-update', () => {
    send({ status: 'checking' })
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    send({ status: 'available', info: { version: info.version } })
  })

  autoUpdater.on('update-not-available', () => {
    send({ status: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    send({
      status: 'downloading',
      progress: {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
        bytesPerSecond: progress.bytesPerSecond
      }
    })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    send({ status: 'downloaded', info: { version: info.version } })
  })

  autoUpdater.on('error', (err: Error) => {
    send({ status: 'error', error: err == null ? 'Update failed' : err.message })
  })

  ipcMain.handle('updater:check', async () => {
    if (!app.isPackaged) {
      console.warn('[updater] Skipping update check in development mode.')
      send({ status: 'not-available' })
      return
    }
    try {
      await autoUpdater.checkForUpdates()
    } catch (err) {
      send({ status: 'error', error: (err as Error).message })
    }
  })

  ipcMain.handle('updater:download', async () => {
    try {
      await autoUpdater.downloadUpdate()
    } catch (err) {
      send({ status: 'error', error: (err as Error).message })
    }
  })

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall()
  })
}

export { initUpdater }
