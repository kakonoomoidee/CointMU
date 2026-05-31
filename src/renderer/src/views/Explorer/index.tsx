import { useState, useEffect, useRef, type JSX, type FormEvent } from 'react'
import { useNetworkStats, useRecentBlocks } from '@/hooks'
import { call, fetchBalance, getNetworkInsights } from '@/services'
import { formatBlockNumber } from '@/utils'
import { Insights } from '@/components/explorer/Insights'
import { ChainTimeline } from '@/components/explorer/ChainTimeline'
import { ExplorerHeader } from './ExplorerHeader'
import { ExplorerSearch } from './ExplorerSearch'
import { ExplorerDataTabs, type TabState } from './ExplorerDataTabs'
import { BlockDetail } from './BlockDetail'
import { TransactionDetail } from './TransactionDetail'

interface ExplorerProps {
  activeWalletAddress: string | null
}

type ViewState = 'MAIN' | 'BLOCK_DETAIL' | 'TX_DETAIL'

interface TopAccount {
  address: string
  balance: number
}

const EMPTY_STAT_LABEL = '--'
const INSIGHTS_POLL_INTERVAL_MS = 3000
const TICK_INTERVAL_MS = 5000
const TX_HASH_LENGTH = 66

/**
 * Explorer view orchestrator. It owns the network insights polling, search,
 * navigation, and account-loading logic, and composes the search, data tables,
 * and detail views from focused presentational sub-components.
 * @param props - The active wallet address used to flag and seed account data.
 * @returns The complete explorer interface.
 */
function Explorer({ activeWalletAddress }: ExplorerProps): JSX.Element {
  const networkStats = useNetworkStats()
  const isConnected = networkStats.isConnected

  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    if (!isConnected) return
    let mounted = true

    async function fetchInsights(): Promise<void> {
      try {
        const data = await getNetworkInsights()
        if (mounted && data) setInsights(data)
      } catch (err) {
        console.warn('Failed to fetch insights:', err)
      }
    }

    fetchInsights()
    const interval = setInterval(fetchInsights, INSIGHTS_POLL_INTERVAL_MS)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [isConnected])

  const recentBlocks = useRecentBlocks(networkStats.blockHeight, isConnected)
  const [, setCurrentTime] = useState<number>(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), TICK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  const [currentView, setCurrentView] = useState<ViewState>('MAIN')
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null)
  const [selectedTx, setSelectedTx] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<TabState>('blocks')

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')

  const [topAccounts, setTopAccounts] = useState<TopAccount[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!searchValue.trim()) return

    const val = searchValue.trim()
    let result: any = null

    if (!isNaN(Number(val)) && val !== '') {
      const hexValue = '0x' + Number(val).toString(16)
      result = await call('eth_getBlockByNumber', [hexValue, true])
    } else if (val.startsWith('0x') && val.length === TX_HASH_LENGTH) {
      result = await call('eth_getBlockByHash', [val, true])
      if (!result) {
        result = await call('eth_getTransactionByHash', [val])
      }
    }

    if (result && result.number !== undefined) {
      setSelectedBlock(result)
      setCurrentView('BLOCK_DETAIL')
      setSearchValue('')
    } else if (result && result.blockHash) {
      setSelectedTx(result)
      setCurrentView('TX_DETAIL')
      setSearchValue('')
    }
  }

  const handleBlockSelect = async (blockNum: number): Promise<void> => {
    const hex = '0x' + blockNum.toString(16)
    const blockData = await call('eth_getBlockByNumber', [hex, true])
    if (blockData && blockData.number !== undefined) {
      setSelectedBlock(blockData)
      setCurrentView('BLOCK_DETAIL')
    }
  }

  const handleTransactionSelect = (tx: any): void => {
    setSelectedTx(tx)
    setCurrentView('TX_DETAIL')
  }

  const handleTransactionBack = (): void => {
    if (selectedBlock && selectedBlock.number === selectedTx.blockNumber) {
      setCurrentView('BLOCK_DETAIL')
    } else {
      handleBlockSelect(parseInt(selectedTx.blockNumber, 16))
    }
  }

  useEffect(() => {
    async function loadAccounts(): Promise<void> {
      if (!isConnected) return
      setIsLoadingAccounts(true)
      const addresses = new Set<string>()
      if (activeWalletAddress) addresses.add(activeWalletAddress.toLowerCase())
      recentBlocks.forEach((b) => addresses.add(b.miner.toLowerCase()))

      const uniqueAddresses = Array.from(addresses)
      if (uniqueAddresses.length === 0) {
        setIsLoadingAccounts(false)
        return
      }

      const balances = await Promise.all(
        uniqueAddresses.map(async (addr) => {
          const balStr = await fetchBalance(addr)
          const num = parseFloat(balStr?.replace(/,/g, '') || '0')
          return { address: addr, balance: isNaN(num) ? 0 : num }
        })
      )

      balances.sort((a, b) => b.balance - a.balance)
      setTopAccounts(balances)
      setIsLoadingAccounts(false)
    }

    if (activeTab === 'accounts') {
      loadAccounts()
    }
  }, [activeTab, recentBlocks, activeWalletAddress, isConnected])

  const networkHeight = isConnected
    ? formatBlockNumber(networkStats.blockHeight)
    : EMPTY_STAT_LABEL

  return (
    <div className="flex flex-col h-full bg-slate-50/80">
      <ExplorerHeader isConnected={isConnected} networkHeight={networkHeight} />

      <main className="flex-1 overflow-y-auto px-8 py-6">
        {currentView === 'MAIN' ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <ExplorerSearch
              searchValue={searchValue}
              searchInputRef={searchInputRef}
              onSearchValueChange={setSearchValue}
              onSubmit={handleSearch}
            />

            <Insights insights={insights} />
            <ChainTimeline
              blocks={insights?.blocks || []}
              coinbase={activeWalletAddress || insights?.coinbase || ''}
              isOnline={insights?.isOnline ?? false}
              onBlockClick={handleBlockSelect}
            />

            <ExplorerDataTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isConnected={isConnected}
              recentBlocks={recentBlocks}
              topAccounts={topAccounts}
              isLoadingAccounts={isLoadingAccounts}
              activeWalletAddress={activeWalletAddress}
              onBlockSelect={handleBlockSelect}
            />
          </div>
        ) : currentView === 'BLOCK_DETAIL' && selectedBlock ? (
          <BlockDetail
            block={selectedBlock}
            onBack={() => setCurrentView('MAIN')}
            onBlockSelect={handleBlockSelect}
            onTransactionSelect={handleTransactionSelect}
          />
        ) : currentView === 'TX_DETAIL' && selectedTx ? (
          <TransactionDetail
            tx={selectedTx}
            onBack={handleTransactionBack}
            onBlockSelect={handleBlockSelect}
          />
        ) : null}
      </main>
    </div>
  )
}

export { Explorer }
