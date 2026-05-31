import { useState, useEffect, type JSX } from 'react'
import { Dashboard, Miner, Wallet, Explorer, Settings, Onboarding } from '@/views'
import { type DerivedAccount, getSetting } from '@/services'
import { useNetworkStats, useBalance, useBalances, useUpdateStatus } from '@/hooks'

import { Sidebar } from '@/components'

const NAV_ITEM_DASHBOARD = 'dashboard'
const NAV_ITEM_MINER = 'miner'
const NAV_ITEM_WALLET = 'wallet'
const NAV_ITEM_EXPLORER = 'explorer'
const NAV_ITEM_SETTINGS = 'settings'
const WALLET_LOAD_DELAY_MS = 300
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
  const networkStats = useNetworkStats()
  const { balance } = useBalance(activeWalletAddress, networkStats.isConnected)
  const { balances } = useBalances(accounts.map((a) => a.address), networkStats.isConnected)
  const updateState = useUpdateStatus()

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoadingWallet(false), WALLET_LOAD_DELAY_MS)
    return (): void => clearTimeout(loadingTimer)
  }, [])

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
   */
  const handleLogout = (): void => {
    setActiveWalletAddress(null)
    setAccounts([])
    setActiveView(NAV_ITEM_DASHBOARD)
  }

  return (
    <div className="flex h-full bg-slate-50">
      <Sidebar
        accounts={accounts}
        activeWalletAddress={activeWalletAddress}
        balance={balance}
        peerCount={networkStats.peerCount}
        activeView={activeView}
        setActiveView={(view) => setActiveView(view as ActiveView)}
        onLogout={handleLogout}
        updateStatus={updateState.status}
      />

      <main className="flex-1 overflow-hidden">
        {activeView === NAV_ITEM_DASHBOARD && (
          <Dashboard activeWalletAddress={activeWalletAddress} />
        )}
        {activeView === NAV_ITEM_MINER && (
          <Miner activeWalletAddress={activeWalletAddress} balance={balance} />
        )}
        {activeView === NAV_ITEM_WALLET && (
          <Wallet 
            accounts={accounts}
            setAccounts={setAccounts}
            activeWalletAddress={activeWalletAddress}
            setActiveWalletAddress={setActiveWalletAddress}
            balance={balance}
            balances={balances}
          />
        )}
        {activeView === NAV_ITEM_EXPLORER && <Explorer activeWalletAddress={activeWalletAddress} />}
        {activeView === NAV_ITEM_SETTINGS && <Settings />}
      </main>
    </div>
  )
}

export default App
