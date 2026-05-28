import { useState, useEffect, type JSX } from 'react'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { AppearanceSettings } from '@/components/settings/AppearanceSettings'
import { NetworkSettings } from '@/components/settings/NetworkSettings'
import { MiningSettings } from '@/components/settings/MiningSettings'

export type SettingsCategory = 'general' | 'appearance' | 'network' | 'mining' | 'security' | 'advanced' | 'about'

const CATEGORIES: { id: SettingsCategory; label: string; icon: JSX.Element }[] = [
  {
    id: 'general',
    label: 'General',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    )
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )
  },
  {
    id: 'network',
    label: 'Network',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    id: 'mining',
    label: 'Mining',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    )
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    )
  },
  {
    id: 'about',
    label: 'About',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )
  }
]

export interface SettingsStore {
  general: {
    launchAtLogin: boolean
    openInBackground: boolean
    pushNotifications: boolean
    notificationSound: boolean
    language: string
    currency: string
  }
  appearance: {
    theme: string
    accentColor: string
    density: string
    showSidebarColors: boolean
    animatedTransitions: boolean
  }
  network: {
    network: string
    rpcEndpoint: string
    maxPeers: number
    discovery: boolean
    listenPort: number
    syncMode: string
    pruneOldState: boolean
  }
  mining: {
    enableMining: boolean
    startAtLaunch: boolean
    threads: number
    intensity: string
    pauseOnBattery: boolean
    mode: string
    rewardAddress: string
  }
}

/**
 * Main Settings view orchestrating the split-pane layout for configuration.
 * Handles loading initial state from electron-store via IPC and provides an
 * updater function to sub-components to persist changes immediately.
 * @returns The Settings interface with left navigation and right content area.
 */
function Settings(): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general')
  const [settings, setSettings] = useState<SettingsStore | null>(null)

  useEffect(() => {
    // Load initial settings from the Electron main process via preload bridge
    const loadSettings = async () => {
      try {
        const data = await window.api.settings.getAll()
        setSettings(data)
      } catch (err) {
        console.error('Failed to load settings from electron-store', err)
      }
    }
    loadSettings()
  }, [])

  const updateSetting = async (section: keyof SettingsStore, key: string, value: any) => {
    if (!settings) return

    // Optimistic UI update
    const updatedSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    }
    setSettings(updatedSettings)

    // Persist to electron-store (e.g. key: 'general.launchAtLogin')
    try {
      await window.api.settings.set(`${section}.${key}`, value)
    } catch (err) {
      console.error(`Failed to save setting ${section}.${key}`, err)
      // Revert if necessary, but omitting for simplicity in this implementation
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
            System
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">Settings</span>
        </div>

        <button className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
          Reset to defaults
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeCategory === cat.id
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent'
              }`}
            >
              <div className={`${activeCategory === cat.id ? 'text-blue-500' : 'text-slate-400'}`}>
                {cat.icon}
              </div>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
          <div className="max-w-3xl">
            {activeCategory === 'general' && (
              <GeneralSettings config={settings.general} onUpdate={(k, v) => updateSetting('general', k, v)} />
            )}
            {activeCategory === 'appearance' && (
              <AppearanceSettings config={settings.appearance} onUpdate={(k, v) => updateSetting('appearance', k, v)} />
            )}
            {activeCategory === 'network' && (
              <NetworkSettings config={settings.network} onUpdate={(k, v) => updateSetting('network', k, v)} />
            )}
            {activeCategory === 'mining' && (
              <MiningSettings config={settings.mining} onUpdate={(k, v) => updateSetting('mining', k, v)} />
            )}
            
            {/* Placeholders for unused categories */}
            {['security', 'advanced', 'about'].includes(activeCategory) && (
              <div className="flex items-center justify-center h-64 text-slate-400">
                This section is under construction.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Settings }
