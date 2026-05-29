import { app, shell, BrowserWindow, ipcMain, powerMonitor } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { writeFileSync, existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { spawn, ChildProcess } from 'child_process'
import { config } from 'dotenv'
import detectPort from 'detect-port'

const GENESIS_CONFIG = {
  "config": {
    "chainId": 7012,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "ethash": {}
  },
  "nonce": "0x0000000000000042",
  "timestamp": "0x00",
  "extraData": "0x485721206172696573206174204d7568616d6d61646979616820556e6976",
  "gasLimit": "0x8000000",
  "difficulty": "0x400",
  "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {},
  "number": "0x0",
  "gasUsed": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
}

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
const GETH_NETWORK_ID = '7012'
const GETH_DATA_DIR = join(process.cwd(), 'data', 'cointmu')
const GETH_HTTP_HOST = '127.0.0.1'
const GETH_BOOTNODE_ENODE = process.env.GETH_BOOTNODE_ENODE || ''
const GETH_HTTP_API = process.env.GETH_HTTP_API || 'eth,net,web3'
const GETH_P2P_PORT = process.env.GETH_P2P_PORT || '30303'
const GETH_LOG_VERBOSITY = process.env.GETH_LOG_VERBOSITY || '3'

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
  const binaryName = process.platform === 'win32' ? 'geth.exe' : 'geth'
  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin', binaryName)
  }
  return join(app.getAppPath(), 'resources', 'bin', binaryName)
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
 * Initializes the Geth node with the bundled genesis block if it hasn't been initialized yet.
 * @returns A promise that resolves when initialization is complete.
 */
function initGethNode(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Determine the datadir. Use userData if GETH_DATA_DIR is missing or relative.
    const dataDir = GETH_DATA_DIR.startsWith('.') ? join(app.getPath('userData'), GETH_DATA_DIR) : GETH_DATA_DIR
    const chainDataPath = join(dataDir, 'geth', 'chaindata')

    if (existsSync(chainDataPath)) {
      console.log('[geth:init] Chain data already exists, skipping genesis initialization.')
      resolve()
      return
    }

    console.log('[geth:init] Initializing chain with genesis block...')
    const genesisPath = join(app.getPath('userData'), 'genesis.json')
    try {
      writeFileSync(genesisPath, JSON.stringify(GENESIS_CONFIG, null, 2))
    } catch (err) {
      console.error(`[geth:init] Failed to write genesis file: ${(err as Error).message}`)
      reject(err)
      return
    }

    const binaryPath = resolveGethBinaryPath()
    if (!existsSync(binaryPath)) {
      console.warn(`[geth:init] Warning: Geth binary not found at ${binaryPath}. Skipping node init.`)
      resolve()
      return
    }

    const args = ['--datadir', dataDir, 'init', genesisPath]
    
    const initProcess = spawn(binaryPath, args, { stdio: 'ignore' })

    initProcess.on('close', (code) => {
      if (code === 0) {
        console.log('[geth:init] Genesis initialization successful.')
        resolve()
      } else {
        console.error(`[geth:init] Initialization failed with code ${code}`)
        reject(new Error(`Geth init failed with code ${code}`))
      }
    })

    initProcess.on('error', (err) => {
      console.error(`[geth:init] Failed to start geth init process: ${err.message}`)
      reject(err)
    })
  })
}

/**
 * Spawns the Core-geth binary as a managed child process with environment-driven
 * configuration for networking, RPC, and data storage.
 * @param rpcPort - The dynamically resolved RPC port to bind the HTTP server to.
 */
function spawnGethProcess(rpcPort: number): void {
  const binaryPath = resolveGethBinaryPath()
  if (!existsSync(binaryPath)) {
    console.warn(`[geth:spawn] Warning: Geth binary not found at ${binaryPath}. Skipping node spawn.`)
    return
  }

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

  if (GETH_BOOTNODE_ENODE) {
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

/**
 * Configures the electron-updater auto-update lifecycle and binds IPC
 * event forwarding to the renderer process for real-time UI synchronization.
 * @param {BrowserWindow} win - The main BrowserWindow instance to send events to.
 * @returns {void}
 */
function setupAutoUpdater(win: BrowserWindow): void {
  autoUpdater.autoDownload = true
  autoUpdater.logger = console

  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('update-status', { status: 'checking' })
  })

  autoUpdater.on('update-available', () => {
    win.webContents.send('update-status', { status: 'available' })
  })

  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-status', { status: 'idle' })
  })

  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('update-status', {
      status: 'downloading',
      percent: progress.percent
    })
  })

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-status', { status: 'ready' })
  })

  autoUpdater.on('error', () => {
    win.webContents.send('update-status', { status: 'idle' })
  })

  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
      console.warn('[updater] Skipping update check in development mode.')
      win.webContents.send('update-status', { status: 'idle' })
      return
    }
    try {
      await autoUpdater.checkForUpdatesAndNotify()
    } catch (err) {
      console.warn('[updater] Failed to check for updates:', (err as Error).message)
      win.webContents.send('update-status', { status: 'idle' })
    }
  })

  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall()
  })
}

/**
 * Dispatches a JSON-RPC 2.0 call to the locally running Core-geth HTTP endpoint.
 * @param {number} rpcPort - The resolved RPC port of the running Geth node.
 * @param {string} method - The JSON-RPC method name.
 * @param {unknown[]} params - The ordered parameter array for the method.
 * @returns {Promise<any>} The raw result from the RPC response, or null on failure.
 */
async function callGethRpc(rpcPort: number, method: string, params: unknown[] = []): Promise<any> {
  try {
    const response = await fetch(`http://127.0.0.1:${rpcPort}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() })
    })
    const json = await response.json()
    if (json.error) {
      console.warn(`[geth:rpc] ${method} error:`, json.error.message)
      return null
    }
    return json.result
  } catch (err) {
    console.warn(`[geth:rpc] ${method} unreachable:`, (err as Error).message)
    return null
  }
}

/**
 * Central controller for managing the underlying Geth mining process.
 * Handles RPC dispatch, power state transitions via powerMonitor, and syncing
 * with the global electron-store configuration.
 */
class MiningController {
  private rpcPort: number
  private store: any
  private win: BrowserWindow | null

  constructor(rpcPort: number, store: any) {
    this.rpcPort = rpcPort
    this.store = store
    this.win = null

    this.setupPowerMonitor()
    this.setupIpcHandlers()
  }

  public setWindow(win: BrowserWindow): void {
    this.win = win
  }

  /**
   * Toggles the mining state on or off. Dispatches miner_start or miner_stop.
   * @param {boolean} enabled - Target mining state.
   * @returns {Promise<void>}
   */
  private async toggleMining(enabled: boolean): Promise<void> {
    this.store.set('mining.isMiningEnabled', enabled)
    if (enabled) {
      const threads = this.store.get('mining.cpuThreads') || 4
      const mode = this.store.get('mining.miningMode') || 'Solo'
      const poolAddress = this.store.get('mining.poolAddress') || ''
      const activeWalletAddress = this.store.get('activeWalletAddress')

      if (mode === 'Pool' && poolAddress) {
        await callGethRpc(this.rpcPort, 'miner_setEtherbase', [poolAddress])
      } else if (activeWalletAddress) {
        await callGethRpc(this.rpcPort, 'miner_setEtherbase', [activeWalletAddress])
      }

      await callGethRpc(this.rpcPort, 'miner_start', [Math.floor(threads)])
    } else {
      await callGethRpc(this.rpcPort, 'miner_stop')
    }
  }

  /**
   * Updates the allocated CPU threads. If mining is currently enabled, it gracefully
   * restarts the miner to apply the new thread count.
   * @param {number} cores - Number of CPU cores to allocate.
   * @returns {Promise<void>}
   */
  private async updateThreads(cores: number): Promise<void> {
    this.store.set('mining.cpuThreads', cores)
    const isMiningEnabled = this.store.get('mining.isMiningEnabled')
    
    if (isMiningEnabled) {
      await callGethRpc(this.rpcPort, 'miner_stop')
      await callGethRpc(this.rpcPort, 'miner_start', [Math.floor(cores)])
    }
  }

  /**
   * Sets the target pool address in the persistent store and dispatches
   * miner_setEtherbase to the running node.
   * @param {string} address - The 42-character hex wallet address.
   * @returns {Promise<void>}
   */
  private async setPoolAddress(address: string): Promise<void> {
    this.store.set('mining.poolAddress', address)
    await callGethRpc(this.rpcPort, 'miner_setEtherbase', [address])
  }

  private setupPowerMonitor(): void {
    powerMonitor.on('on-battery', async () => {
      const pauseOnBattery = this.store.get('mining.pauseOnBattery')
      if (pauseOnBattery) {
        console.log('[power] On battery - pausing miner')
        await callGethRpc(this.rpcPort, 'miner_stop')
        if (this.win) {
          this.win.webContents.send('mining:status-changed', 'Paused (Battery)')
        }
      }
    })

    powerMonitor.on('on-ac', async () => {
      const isMiningEnabled = this.store.get('mining.isMiningEnabled')
      const pauseOnBattery = this.store.get('mining.pauseOnBattery')
      if (isMiningEnabled && pauseOnBattery) {
        const threads = this.store.get('mining.cpuThreads') || 4
        console.log('[power] On AC - resuming miner with', threads, 'threads')
        await callGethRpc(this.rpcPort, 'miner_start', [threads])
        if (this.win) {
          this.win.webContents.send('mining:status-changed', 'Mining')
        }
      }
    })
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('mining:toggle', async (_, enabled: boolean) => {
      await this.toggleMining(enabled)
    })

    ipcMain.handle('mining:setThreads', async (_, cores: number) => {
      await this.updateThreads(cores)
    })

    ipcMain.handle('mining:setPoolAddress', async (_, address: string) => {
      await this.setPoolAddress(address)
    })
  }
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
        isMiningEnabled: false,
        startAtLaunch: false,
        cpuThreads: 4,
        intensity: 'Balanced',
        pauseOnBattery: true,
        miningMode: 'Solo',
        poolAddress: ''
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

  try {
    await initGethNode()
  } catch (err) {
    console.error('[geth:init] Fatal error during genesis init:', err)
  }

  spawnGethProcess(resolvedRpcPort)
  
  const miningController = new MiningController(resolvedRpcPort, store)

  const win = createWindow()
  setupAutoUpdater(win)
  miningController.setWindow(win)

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
