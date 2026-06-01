import { useState, useEffect, Suspense, lazy, type JSX } from 'react'
import ms from 'ms'
import { Dashboard, Wallet, Onboarding } from '@/views'
import { type DerivedAccount, getSetting } from '@/services'
import { useUpdater, useMiningLogStream } from '@/hooks'
import { useOnboardingStore, useAppStore, useNotificationStore } from '@/store'

import { Sidebar, ToastViewport } from '@/components'

const Miner = lazy(() => import('@/views/Miner').then((m) => ({ default: m.Miner })))
const Explorer = lazy(() => import('@/views/Explorer').then((m) => ({ default: m.Explorer })))
const Settings = lazy(() => import('@/views/Settings').then((m) => ({ default: m.Settings })))

const NAV_ITEM_DASHBOARD = 'dashboard'
const NAV_ITEM_MINER = 'miner'
const NAV_ITEM_WALLET = 'wallet'
const NAV_ITEM_EXPLORER = 'explorer'
const NAV_ITEM_SETTINGS = 'settings'
const WALLET_LOAD_DELAY_MS = 300
const GLOBAL_POLL_INTERVAL_MS = ms('3s')
type ActiveView = typeof NAV_ITEM_DASHBOARD | typeof NAV_ITEM_MINER | typeof NAV_ITEM_WALLET | typeof NAV_ITEM_EXPLORER | typeof NAV_ITEM_SETTINGS

/**
 * Root application component rendering a sidebar navigation layout
 * with view routing between Dashboard and Miner panels. Sidebar
 * matches the reference design with CointMU branding, workspace
 * navigation sections, and a bottom wallet status bar.
 * @returns The top-level application shell with sidebar and content area.
 */
function App(): JSX.Element {
  const [activeWalletAddress, setActiveWalletAddress] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<DerivedAccount[]>([])
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(true)
  const [activeView, setActiveView] = useState<ActiveView>(NAV_ITEM_DASHBOARD)
  const [settingsTab, setSettingsTab] = useState<string>('general')
  const updater = useUpdater()
  useMiningLogStream()

  useEffect(() => {
    void useNotificationStore.getState().hydrate()
  }, [])

  const handleNavigate = (view: string, payload?: any) => {
    setActiveView(view as ActiveView)
    if (view === NAV_ITEM_SETTINGS && payload) {
      setSettingsTab(payload)
    }
  }

  const accountsKey = accounts.map((a) => a.address).join(',')

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoadingWallet(false), WALLET_LOAD_DELAY_MS)
    return (): void => clearTimeout(loadingTimer)
  }, [])

  useEffect(() => {
    useAppStore.getState().setActiveAccount(activeWalletAddress)
  }, [activeWalletAddress])

  useEffect(() => {
    const addresses = accountsKey.length > 0 ? accountsKey.split(',') : []
    const runPoll = (): void => {
      void useAppStore.getState().fetchGlobalStats(activeWalletAddress, addresses)
    }
    runPoll()
    const intervalId = setInterval(runPoll, GLOBAL_POLL_INTERVAL_MS)
    return (): void => clearInterval(intervalId)
  }, [activeWalletAddress, accountsKey])

  if (isLoadingWallet) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  if (!activeWalletAddress) {
    const handleOnboardingComplete = async (address: string): Promise<void> => {
      const storedAccounts = (await getSetting<DerivedAccount[]>('accounts')) || []
      setAccounts(storedAccounts)
      setActiveWalletAddress(address)
    }

    return <Onboarding onComplete={(address) => handleOnboardingComplete(address)} />
  }

  /**
   * Locks the wallet by clearing the decrypted session state in React.
   * Does NOT delete the encrypted payload from the persistent electron-store.
   * Also resets the transient Onboarding UI state back to the initial screen.
   */
  const handleLogout = (): void => {
    useOnboardingStore.getState().reset()
    setActiveWalletAddress(null)
    setAccounts([])
    setActiveView(NAV_ITEM_DASHBOARD)
  }

  return (
    <div className="flex h-full bg-slate-50">
      <ToastViewport />
      <Sidebar
        accounts={accounts}
        activeWalletAddress={activeWalletAddress}
        activeView={activeView}
        setActiveView={(view) => handleNavigate(view as ActiveView)}
        onLogout={handleLogout}
        updateStatus={updater.status}
      />

      <main className="flex-1 overflow-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full w-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {activeView === NAV_ITEM_DASHBOARD && (
            <Dashboard
              activeWalletAddress={activeWalletAddress}
              accounts={accounts}
              onNavigate={handleNavigate}
            />
          )}
          {activeView === NAV_ITEM_MINER && (
            <Miner 
              activeWalletAddress={activeWalletAddress} 
              accounts={accounts} 
              onNavigate={handleNavigate}
            />
          )}
          {activeView === NAV_ITEM_WALLET && (
            <Wallet
              accounts={accounts}
              setAccounts={setAccounts}
              activeWalletAddress={activeWalletAddress}
              setActiveWalletAddress={setActiveWalletAddress}
            />
          )}
          {activeView === NAV_ITEM_EXPLORER && (
            <Explorer activeWalletAddress={activeWalletAddress} accounts={accounts} />
          )}
          {activeView === NAV_ITEM_SETTINGS && <Settings initialCategory={settingsTab as any} />}
        </Suspense>
      </main>
    </div>
  )
}

export default App
