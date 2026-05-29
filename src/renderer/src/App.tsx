import { useState, useEffect, type JSX } from 'react'
import { Dashboard, Miner, Wallet, Explorer, Settings, Onboarding } from '@/views'
import { type DerivedAccount } from '@/services'
import { useNetworkStats, useBalance } from '@/hooks'

import { Sidebar } from '@/components'

const NAV_ITEM_DASHBOARD = 'dashboard'
const NAV_ITEM_MINER = 'miner'
const NAV_ITEM_WALLET = 'wallet'
const NAV_ITEM_EXPLORER = 'explorer'
const NAV_ITEM_SETTINGS = 'settings'
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

  useEffect(() => {
    // We only simulate a loading delay. We DO NOT auto-load activeWalletAddress
    // because enterprise wallets require the user to enter their password
    // via the Onboarding (Unlock) screen first.
    setTimeout(() => setIsLoadingWallet(false), 300)
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
      const storedAccounts = await window.api.settings.get('accounts') || []
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
      />

      <main className="flex-1 overflow-hidden">
        {activeView === NAV_ITEM_DASHBOARD && (
          <Dashboard activeWalletAddress={activeWalletAddress} />
        )}
        {activeView === NAV_ITEM_MINER && (
          <Miner activeWalletAddress={activeWalletAddress} />
        )}
        {activeView === NAV_ITEM_WALLET && (
          <Wallet 
            accounts={accounts}
            setAccounts={setAccounts}
            activeWalletAddress={activeWalletAddress}
            setActiveWalletAddress={setActiveWalletAddress}
            balance={balance}
          />
        )}
        {activeView === NAV_ITEM_EXPLORER && <Explorer />}
        {activeView === NAV_ITEM_SETTINGS && <Settings />}
      </main>
    </div>
  )
}

export default App
