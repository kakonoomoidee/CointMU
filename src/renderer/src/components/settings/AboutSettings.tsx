import { useState, useEffect, type JSX } from 'react'
import ms from 'ms'
import { useUpdater } from '@/hooks'
import { useAppStore } from '@/store'
import { EXTERNAL_LINKS } from '@/constants'
import { IconLayers } from '@/assets/icons'

const UPTIME_REFRESH_MS = ms('1m')

/**
 * Formats raw system uptime seconds into a readable string.
 * @param {number} seconds - The total uptime in seconds.
 * @returns {string} The formatted uptime string.
 */
const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (d > 0) return `${d} days ${h} hours`
  if (h > 0) return `${h} hours ${m} minutes`
  if (m > 0) return `${m} minutes ${s} seconds`
  return `${s} seconds`
}

/**
 * Formats a byte count into a compact human-readable size string.
 * @param {number} bytes - The number of bytes to format.
 * @returns {string} The formatted size (for example '12.3 MB').
 */
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

/**
 * About pane containing system information, node version, chain ID,
 * uptime, external resource links, and an integrated auto-update control
 * bound to the Electron IPC bridge.
 * @returns {JSX.Element} The About Settings view component.
 */
export function AboutSettings(): JSX.Element {
  const [uptimeStr, setUptimeStr] = useState<string>('Loading...')
  const [chainId, setChainId] = useState<number | null>(null)
  const [isEditingChain, setIsEditingChain] = useState<boolean>(false)
  const [newChainIdInput, setNewChainIdInput] = useState<string>('')
  const [isSavingChain, setIsSavingChain] = useState<boolean>(false)

  const peerCount = useAppStore((s) => s.peerCount)
  const updater = useUpdater()

  const sysInfo = window.systemInfo || {
    version: '0.0.1',
    build: 0,
    platform: 'Unknown',
    nodeVersion: 'Unknown',
    getUptime: () => 0
  }

  useEffect(() => {
    const updateUptime = (): void => {
      setUptimeStr(formatUptime(sysInfo.getUptime()))
    }
    updateUptime()
    const interval = setInterval(updateUptime, UPTIME_REFRESH_MS)

    const fetchGenesis = async (): Promise<void> => {
      try {
        const genesis = await window.api.network.getGenesisConfig()
        if (genesis && genesis.config && genesis.config.chainId) {
          setChainId(genesis.config.chainId)
          setNewChainIdInput(String(genesis.config.chainId))
        }
      } catch (err) {
        console.error('Failed to fetch genesis config', err)
      }
    }
    fetchGenesis()

    return () => clearInterval(interval)
  }, [])

  const handleSaveChainId = async (): Promise<void> => {
    const parsedId = parseInt(newChainIdInput, 10)
    if (isNaN(parsedId) || parsedId <= 0) return

    const confirmed = window.confirm(
      'WARNING: Changing the Chain ID will permanently WIPE your existing local blockchain data and restart the node. Are you absolutely sure you want to proceed?'
    )

    if (!confirmed) return

    setIsSavingChain(true)
    try {
      const success = await window.api.network.setChainId(parsedId)
      if (success) {
        setChainId(parsedId)
        setIsEditingChain(false)
        alert('Chain ID updated successfully. The node is restarting with a fresh blockchain.')
      } else {
        alert('Failed to update the Chain ID.')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while setting the Chain ID.')
    } finally {
      setIsSavingChain(false)
    }
  }

  return (
    <div>
      <div className="flex items-start gap-6 mb-12">
        <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <IconLayers width={40} height={40} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CointMU</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Version {window.systemInfo?.version || '0.0.1'} (build {window.systemInfo?.build || 0}) {'\u2022'} {window.systemInfo?.platform || 'Unknown'}
          </p>
          <p className="text-sm font-medium text-slate-400 mt-1">{'\u00A9'} 2026 CointMU Foundation {'\u2022'} MIT License</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => window.open(EXTERNAL_LINKS.RELEASE_NOTES, '_blank')}
              className="px-4 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              Release notes
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Updates</h3>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            {updater.status === 'checking' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">Checking for updates</p>
                  <p className="text-xs text-slate-500 mt-0.5">Contacting the update server...</p>
                </div>
                <button
                  disabled
                  className="px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm bg-slate-300 text-slate-500 cursor-not-allowed"
                >
                  Checking...
                </button>
              </div>
            )}

            {updater.status === 'available' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">Update available</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Version {updater.info?.version ?? 'unknown'} is ready to download.
                  </p>
                </div>
                <button
                  onClick={() => updater.download()}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Download Update
                </button>
              </div>
            )}

            {updater.status === 'downloading' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-800">Downloading update</p>
                  <span className="text-sm font-medium font-mono text-slate-600">
                    {Math.round(updater.progress?.percent ?? 0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${updater.progress?.percent ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formatBytes(updater.progress?.transferred ?? 0)} / {formatBytes(updater.progress?.total ?? 0)}
                </p>
              </div>
            )}

            {updater.status === 'downloaded' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">Update ready to install</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Version {updater.info?.version ?? 'unknown'} has been downloaded.
                  </p>
                </div>
                <button
                  onClick={() => updater.install()}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Restart & Install
                </button>
              </div>
            )}

            {(updater.status === 'idle' || updater.status === 'not-available' || updater.status === 'error') && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">Software updates</p>
                  {updater.status === 'error' ? (
                    <p className="text-xs text-red-500 mt-0.5">{updater.error ?? 'Failed to check for updates.'}</p>
                  ) : updater.status === 'not-available' ? (
                    <p className="text-xs text-slate-500 mt-0.5">You are on the latest version.</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-0.5">Check whether a newer version is available.</p>
                  )}
                </div>
                <button
                  onClick={() => updater.check()}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Check for Updates
                </button>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">System</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Node version</p>
              <span className="text-sm font-medium font-mono text-slate-600">cointmu/v{sysInfo.version}-stable (Node v{sysInfo.nodeVersion})</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Chain ID</p>
              <div className="flex items-center gap-3">
                {isEditingChain ? (
                  <>
                    <input
                      type="number"
                      className="w-24 text-sm font-medium font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                      value={newChainIdInput}
                      onChange={(e) => setNewChainIdInput(e.target.value)}
                      disabled={isSavingChain}
                    />
                    <button
                      onClick={handleSaveChainId}
                      disabled={isSavingChain}
                      className="text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded px-2.5 py-1 transition-colors"
                    >
                      {isSavingChain ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingChain(false)
                        setNewChainIdInput(String(chainId))
                      }}
                      disabled={isSavingChain}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium font-mono text-slate-600">
                      {chainId !== null ? chainId : '--'}
                    </span>
                    <button
                      onClick={() => setIsEditingChain(true)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Connected peers</p>
              <span className="text-sm font-medium font-mono text-slate-600">{peerCount !== null ? peerCount : '--'}</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-bold text-slate-800">Uptime</p>
              <span className="text-sm font-bold text-slate-800">{uptimeStr}</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Links</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <button 
              onClick={() => window.open(EXTERNAL_LINKS.DOCUMENTATION, '_blank')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Documentation</p>
                <p className="text-xs text-slate-500 mt-0.5">Guides, API reference, RPC schema</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">{'Open \u203A'}</span>
            </button>
            
            <button 
              onClick={() => window.open(EXTERNAL_LINKS.GITHUB_REPO, '_blank')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">GitHub</p>
                <p className="text-xs text-slate-500 mt-0.5">github.com/kakonoomoidee/CointMU</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">{'Open \u203A'}</span>
            </button>
            
            <button 
              onClick={() => window.open(EXTERNAL_LINKS.REPORT_ISSUE, '_blank')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Report an issue</p>
                <p className="text-xs text-slate-500 mt-0.5">Send a bug report or feature request</p>
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">{'Open \u203A'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
