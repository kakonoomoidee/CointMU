import { useState, useEffect, type JSX } from 'react'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { AppearanceSettings } from '@/components/settings/AppearanceSettings'
import { NetworkSettings } from '@/components/settings/NetworkSettings'
import { MiningSettings } from '@/components/settings/MiningSettings'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { AdvancedSettings } from '@/components/settings/AdvancedSettings'
import { AboutSettings } from '@/components/settings/AboutSettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { getAllSettings, setSetting } from '@/services'
import {
  IconSun,
  IconImage,
  IconBolt,
  IconLayers,
  IconLock,
  IconSettings,
  IconBox,
  IconBell
} from '@/assets/icons'

export type SettingsCategory = 'general' | 'appearance' | 'notifications' | 'network' | 'mining' | 'security' | 'advanced' | 'about'

const CATEGORIES: { id: SettingsCategory; label: string; icon: JSX.Element }[] = [
  {
    id: 'general',
    label: 'General',
    icon: (
      <IconSun width={16} height={16} strokeWidth={2.5} />
    )
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <IconImage width={16} height={16} />
    )
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <IconBell width={16} height={16} />
    )
  },
  {
    id: 'network',
    label: 'Network',
    icon: (
      <IconBolt width={16} height={16} strokeWidth={2.5} />
    )
  },
  {
    id: 'mining',
    label: 'Mining',
    icon: (
      <IconLayers width={16} height={16} />
    )
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <IconLock width={16} height={16} />
    )
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: (
      <IconSettings width={16} height={16} />
    )
  },
  {
    id: 'about',
    label: 'About',
    icon: (
      <IconBox width={16} height={16} />
    )
  }
]

export interface SettingsStore {
  mnemonic: string | null
  activeWalletAddress: string | null
  accounts: { address: string; label: string }[]
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
    isMiningEnabled: boolean
    startAtLaunch: boolean
    cpuThreads: number
    intensity: string
    pauseOnBattery: boolean
    miningMode: string
    poolAddress: string
  }
  security: {
    autoLock: boolean
    requireBiometrics: boolean
  }
  advanced: {
    httpRpc: boolean
    wsRpc: boolean
    corsOrigins: string
    logLevel: string
    analytics: boolean
  }
}

interface SettingsProps {
  initialCategory?: SettingsCategory
}

/**
 * Main Settings view orchestrating the split-pane layout for configuration.
 * Handles loading initial state from electron-store via IPC and provides an
 * updater function to sub-components to persist changes immediately.
 * @param props - Settings configuration.
 * @returns The Settings interface with left navigation and right content area.
 */
function Settings({ initialCategory = 'general' }: SettingsProps = {}): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory)
  const [settings, setSettings] = useState<SettingsStore | null>(null)

  useEffect(() => {
    // Load initial settings from the Electron main process via preload bridge
    const loadSettings = async () => {
      try {
        const data = await getAllSettings()
        setSettings(data as SettingsStore)
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
        ...(settings[section] as any),
        [key]: value
      }
    }
    setSettings(updatedSettings)

    // Persist to electron-store (e.g. key: 'general.launchAtLogin')
    try {
      await setSetting(`${section}.${key}`, value)
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
            {activeCategory === 'notifications' && (
              <NotificationSettings />
            )}
            {activeCategory === 'network' && (
              <NetworkSettings config={settings.network} onUpdate={(k, v) => updateSetting('network', k, v)} />
            )}
            {activeCategory === 'mining' && (
              <MiningSettings config={settings.mining} accounts={settings.accounts} onUpdate={(k, v) => updateSetting('mining', k, v)} />
            )}
            {activeCategory === 'security' && (
              <SecuritySettings />
            )}
            {activeCategory === 'advanced' && (
              <AdvancedSettings />
            )}
            {activeCategory === 'about' && (
              <AboutSettings />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Settings }
