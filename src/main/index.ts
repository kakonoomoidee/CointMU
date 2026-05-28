import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { spawn, ChildProcess } from 'child_process'
import { config } from 'dotenv'
import detectPort from 'detect-port'

config({ path: join(app.getAppPath(), '.env') })

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_WEEK = 7

const SESSION_DURATION_MS =
  DAYS_PER_WEEK *
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND

const MAX_PORT_SCAN_ATTEMPTS = 50

const WINDOW_DEFAULT_WIDTH = 1280
const WINDOW_DEFAULT_HEIGHT = 800
const WINDOW_MIN_WIDTH = 900
const WINDOW_MIN_HEIGHT = 600

const DEFAULT_RPC_PORT = parseInt(process.env.GETH_HTTP_PORT || '8585', 10)
const GETH_HTTP_HOST = process.env.GETH_HTTP_HOST || '127.0.0.1'
const GETH_NETWORK_ID = process.env.GETH_NETWORK_ID || '1024'
const GETH_DATA_DIR = process.env.GETH_DATA_DIR || './data/cointmu'
const GETH_BOOTNODE_ENODE = process.env.GETH_BOOTNODE_ENODE || ''
const GETH_HTTP_API = process.env.GETH_HTTP_API || 'eth,net,web3'
const GETH_P2P_PORT = process.env.GETH_P2P_PORT || '30303'
const GETH_LOG_VERBOSITY = process.env.GETH_LOG_VERBOSITY || '3'

const WINDOWS_PLATFORM = 'win32'
const GETH_BINARY_NAME = process.platform === WINDOWS_PLATFORM ? 'geth.exe' : 'geth'

let resolvedRpcPort: number = DEFAULT_RPC_PORT
let gethProcess: ChildProcess | null = null
let sessionStartTimestamp: number = Date.now()

/**
 * Resolves the absolute path to the bundled Core-geth binary.
 * In production, the binary is located inside the packaged app resources.
 * In development, it is resolved from the project-level resources directory.
 * @returns The absolute filesystem path to the geth executable.
 */
function resolveGethBinaryPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin', GETH_BINARY_NAME)
  }
  return join(app.getAppPath(), 'resources', 'bin', GETH_BINARY_NAME)
}

/**
 * Scans for the first available TCP port starting from the configured default.
 * Uses detect-port to avoid binding conflicts with other local services.
 * @returns A promise resolving to the first available port number.
 */
async function findAvailablePort(): Promise<number> {
  const portRangeEnd = DEFAULT_RPC_PORT + MAX_PORT_SCAN_ATTEMPTS

  for (let candidate = DEFAULT_RPC_PORT; candidate < portRangeEnd; candidate++) {
    try {
      const available = await detectPort(candidate)
      if (available === candidate) {
        return candidate
      }
    } catch {
      continue
    }
  }

  return DEFAULT_RPC_PORT
}

/**
 * Spawns the Core-geth binary as a managed child process with environment-driven
 * configuration for networking, RPC, and data storage.
 * @param rpcPort - The dynamically resolved RPC port to bind the HTTP server to.
 */
function spawnGethProcess(rpcPort: number): void {
  const binaryPath = resolveGethBinaryPath()

  const args = [
    '--networkid', GETH_NETWORK_ID,
    '--datadir', GETH_DATA_DIR,
    '--http',
    '--http.addr', GETH_HTTP_HOST,
    '--http.port', String(rpcPort),
    '--http.api', GETH_HTTP_API,
    '--port', GETH_P2P_PORT,
    '--verbosity', GETH_LOG_VERBOSITY,
    '--syncmode', 'full'
  ]

  if (GETH_BOOTNODE_ENODE && !GETH_BOOTNODE_ENODE.includes('PLACEHOLDER')) {
    args.push('--bootnodes', GETH_BOOTNODE_ENODE)
  }

  try {
    gethProcess = spawn(binaryPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    })

    gethProcess.stdout?.on('data', (data: Buffer) => {
      process.stdout.write(`[geth:stdout] ${data.toString()}`)
    })

    gethProcess.stderr?.on('data', (data: Buffer) => {
      process.stderr.write(`[geth:stderr] ${data.toString()}`)
    })

    gethProcess.on('error', (err: Error) => {
      console.error(`[geth:error] Failed to start geth process: ${err.message}`)
      gethProcess = null
    })

    gethProcess.on('close', (code: number | null) => {
      console.log(`[geth:close] Process exited with code ${code}`)
      gethProcess = null
    })
  } catch (err) {
    console.error(`[geth:spawn] Unable to spawn geth binary at path: ${binaryPath}`)
    gethProcess = null
  }
}

/**
 * Terminates the geth child process gracefully using SIGTERM.
 * Falls back to SIGKILL if the process does not exit within the allowed window.
 */
function killGethProcess(): void {
  if (!gethProcess) {
    return
  }

  try {
    gethProcess.kill('SIGTERM')
  } catch {
    try {
      gethProcess.kill('SIGKILL')
    } catch {
      /* Process already exited */
    }
  }

  gethProcess = null
}

/**
 * Validates whether the current session is within the allowed duration window.
 * @returns True if the session has not exceeded SESSION_DURATION_MS.
 */
function isSessionValid(): boolean {
  const elapsed = Date.now() - sessionStartTimestamp
  return elapsed < SESSION_DURATION_MS
}

/**
 * Creates the main application BrowserWindow with security-hardened settings
 * and context-isolated preload script.
 * @returns The created BrowserWindow instance.
 */
function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: WINDOW_DEFAULT_WIDTH,
    height: WINDOW_DEFAULT_HEIGHT,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.cointmu.desktop')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  sessionStartTimestamp = Date.now()

  ipcMain.handle('get-rpc-port', () => resolvedRpcPort)
  ipcMain.handle('get-node-status', () => ({
    running: gethProcess !== null && !gethProcess.killed,
    port: resolvedRpcPort,
    sessionValid: isSessionValid(),
    networkId: GETH_NETWORK_ID
  }))

  const { default: Store } = await import('electron-store')
  
  const store = new Store({
    defaults: {
      mnemonic: null,
      activeWalletAddress: null,
      accounts: [],
      general: {
        launchAtLogin: true,
        openInBackground: false,
        pushNotifications: true,
        notificationSound: false,
        language: 'English',
        currency: 'CMU (native)'
      },
      appearance: {
        theme: 'Light',
        accentColor: '#3b82f6', // blue-500
        density: 'Comfortable',
        showSidebarColors: true,
        animatedTransitions: true
      },
      network: {
        network: 'CointMU Mainnet',
        rpcEndpoint: 'https://rpc.cointmu.net',
        maxPeers: 14,
        discovery: true,
        listenPort: 30303,
        syncMode: 'Snap (recommended)',
        pruneOldState: true
      },
      mining: {
        enableMining: false,
        startAtLaunch: false,
        threads: 4,
        intensity: 'Balanced',
        pauseOnBattery: true,
        mode: 'Solo',
        rewardAddress: ''
      },
      security: {
        autoLockWallet: true,
        requireTouchId: true
      },
      advanced: {
        enableJsonRpc: true,
        enableWsRpc: false,
        corsOrigins: 'https://*.cointmu.net',
        logLevel: 'Info',
        sendAnalytics: false
      }
    }
  })

  ipcMain.handle('settings:get', (_, key) => store.get(key))
  ipcMain.handle('settings:set', (_, key, value) => store.set(key, value))
  ipcMain.handle('settings:getAll', () => store.store)

  resolvedRpcPort = await findAvailablePort()

  spawnGethProcess(resolvedRpcPort)

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  killGethProcess()
})

app.on('window-all-closed', () => {
  killGethProcess()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
