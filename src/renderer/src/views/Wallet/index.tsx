import { useEffect, useState, type JSX, type MouseEvent } from 'react'
import ms from 'ms'
import {
  deriveAccount,
  generateIdenticonGradient,
  deriveAccountFromPrivateKey,
  getSetting,
  setSetting,
  call,
  encryptSecret,
  decryptSecret,
  getSessionPassword,
  waitForTransactionReceipt,
  type DerivedAccount
} from '@/services'
import { useWalletUiStore, useAppStore } from '@/store'
import { ethers } from 'ethers'
import { WalletHeader } from './WalletHeader'
import { AccountSidebar } from './AccountSidebar'
import { AccountHeroCard } from './AccountHeroCard'
import { WalletTabs, type WalletTab } from './WalletTabs'
import { WalletModals } from './modals/WalletModals'

const TX_GAS_LIMIT = 21000n
const COPY_FEEDBACK_MS = ms('2s')

interface WalletProps {
  accounts: DerivedAccount[]
  setAccounts: (accounts: DerivedAccount[]) => void
  activeWalletAddress: string | null
  setActiveWalletAddress: (address: string) => void
}

/**
 * Wallet view orchestrator. It owns the account-management and transaction
 * signing business logic, sources transient UI and form state from the wallet UI
 * store, reads the shared balances from the global app store, and composes the
 * layout from focused presentational sub-components.
 * @param props - Account list and setters, and the active address and setter.
 * @returns The complete wallet view with sidebar, hero card, tabs, and modals.
 */
function Wallet({
  accounts,
  setAccounts,
  activeWalletAddress,
  setActiveWalletAddress
}: WalletProps): JSX.Element {
  const balance = useAppStore((s) => s.balance)
  const balances = useAppStore((s) => s.balances)
  const addPendingTransaction = useAppStore((s) => s.addPendingTransaction)
  const removePendingTransaction = useAppStore((s) => s.removePendingTransaction)
  const fetchGlobalStats = useAppStore((s) => s.fetchGlobalStats)
  const [activeTab, setActiveTab] = useState<WalletTab>('activity')

  const copied = useWalletUiStore((s) => s.copied)
  const sendTo = useWalletUiStore((s) => s.sendTo)
  const sendAmount = useWalletUiStore((s) => s.sendAmount)
  const sendGasPrice = useWalletUiStore((s) => s.sendGasPrice)
  const addAccountType = useWalletUiStore((s) => s.addAccountType)
  const importInput = useWalletUiStore((s) => s.importInput)
  const setModalState = useWalletUiStore((s) => s.setModalState)
  const setCopied = useWalletUiStore((s) => s.setCopied)
  const setSendGasPrice = useWalletUiStore((s) => s.setSendGasPrice)
  const setSendLoading = useWalletUiStore((s) => s.setSendLoading)
  const setSendError = useWalletUiStore((s) => s.setSendError)
  const setAddAccountError = useWalletUiStore((s) => s.setAddAccountError)
  const resetSendForm = useWalletUiStore((s) => s.resetSendForm)
  const resetAddAccountForm = useWalletUiStore((s) => s.resetAddAccountForm)
  const modalState = useWalletUiStore((s) => s.modalState)

  const activeAccount = accounts.find((a) => a.address === activeWalletAddress) || accounts[0]
  const activeGradient = activeAccount
    ? generateIdenticonGradient(activeAccount.address)
    : 'from-slate-400 to-slate-500'

  useEffect(() => {
    if (modalState === 'SEND') {
      resetSendForm()
      call('eth_gasPrice', []).then((price) => {
        if (price) setSendGasPrice(price)
      })
    } else if (modalState === 'ADD_ACCOUNT') {
      resetAddAccountForm()
    }
    setCopied(false)
  }, [modalState, resetSendForm, resetAddAccountForm, setSendGasPrice, setCopied])

  const handleAccountSwitch = async (address: string): Promise<void> => {
    await setSetting('activeWalletAddress', address)
    setActiveWalletAddress(address)
  }

  const handleHideAccount = async (e: MouseEvent, address: string): Promise<void> => {
    e.stopPropagation()
    if (address === activeWalletAddress) {
      return
    }
    const updatedAccounts = accounts.map((acc) =>
      acc.address === address ? { ...acc, isHidden: true } : acc
    )
    await setSetting('accounts', updatedAccounts)
    setAccounts(updatedAccounts)
  }

  const handleUnhideAccount = async (address: string): Promise<void> => {
    const updatedAccounts = accounts.map((acc) =>
      acc.address === address ? { ...acc, isHidden: false } : acc
    )
    await setSetting('accounts', updatedAccounts)
    setAccounts(updatedAccounts)
  }

  const handleCopy = (): void => {
    if (activeAccount?.address) {
      navigator.clipboard.writeText(activeAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    }
  }

  const handleSend = async (): Promise<void> => {
    if (useWalletUiStore.getState().sendLoading) {
      return
    }
    if (!sendTo || !sendAmount) {
      setSendError('Please fill in all fields')
      return
    }

    const addresses = accounts.map((a) => a.address)
    const gasEstEth = ethers.formatEther(TX_GAS_LIMIT * BigInt(sendGasPrice || '0'))

    try {
      setSendError('')
      setSendLoading(true)

      const password = getSessionPassword()
      if (!password) throw new Error('Wallet is locked. Please log in again.')

      let wallet: ethers.Wallet | ethers.HDNodeWallet
      if (activeAccount.encryptedKey) {
        const accSecret = await decryptSecret(activeAccount.encryptedKey, password)
        wallet = new ethers.Wallet(accSecret)
      } else {
        const encryptedPayload = await getSetting<string | null>('encryptedPayload')
        if (!encryptedPayload) throw new Error('Wallet is not unlocked')

        const secretKey = await decryptSecret(encryptedPayload, password)

        if (secretKey.split(' ').length === 12) {
          wallet = ethers.HDNodeWallet.fromPhrase(
            secretKey,
            undefined,
            `m/44'/60'/0'/0/${activeAccount.index}`
          )
        } else {
          wallet = new ethers.Wallet(secretKey)
        }
      }

      const nonceHex = await call('eth_getTransactionCount', [activeAccount.address, 'latest'])
      const chainIdHex = await call('eth_chainId', [])

      const tx = {
        to: sendTo,
        value: ethers.parseEther(sendAmount),
        gasLimit: TX_GAS_LIMIT,
        gasPrice: BigInt(sendGasPrice),
        nonce: parseInt(nonceHex, 16),
        chainId: parseInt(chainIdHex, 16)
      }

      const signedTx = await wallet.signTransaction(tx)
      const txHash = await call('eth_sendRawTransaction', [signedTx])

      if (!txHash || !txHash.startsWith('0x')) {
        throw new Error('Transaction failed')
      }

      addPendingTransaction({
        hash: txHash,
        from: activeAccount.address,
        to: sendTo,
        amount: parseFloat(sendAmount),
        timestamp: Date.now(),
        gas: parseFloat(gasEstEth)
      })

      setModalState('NONE')
      void fetchGlobalStats(activeWalletAddress, addresses)

      void waitForTransactionReceipt(txHash, { confirmations: 1 })
        .then(() => {
          removePendingTransaction(txHash)
          return fetchGlobalStats(activeWalletAddress, addresses)
        })
        .catch(() => {
          removePendingTransaction(txHash)
          return fetchGlobalStats(activeWalletAddress, addresses)
        })
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Failed to send transaction')
    } finally {
      setSendLoading(false)
    }
  }

  const handleHDDerivation = async (): Promise<void> => {
    try {
      const encryptedPayload = await getSetting<string | null>('encryptedPayload')
      if (!encryptedPayload) throw new Error('Not unlocked')

      const password = getSessionPassword()
      if (!password) throw new Error('Wallet is locked. Please log in again.')

      const secretKey = await decryptSecret(encryptedPayload, password)
      const newIndex = accounts.length

      let newAccount: DerivedAccount
      if (secretKey.split(' ').length === 12) {
        newAccount = deriveAccount(secretKey, newIndex, `Account ${newIndex + 1}`)
      } else {
        const randomWallet = ethers.Wallet.createRandom()
        newAccount = deriveAccountFromPrivateKey(randomWallet.privateKey, `Account ${newIndex + 1}`)
        newAccount.encryptedKey = await encryptSecret(randomWallet.privateKey, password)
      }

      const updatedAccounts = [...accounts, newAccount]
      await setSetting('accounts', updatedAccounts)
      setAccounts(updatedAccounts)
      await handleAccountSwitch(newAccount.address)
    } catch (e) {
      console.error('HD Derivation Error:', e)
    }
  }

  const handleCreateOrImportAccount = async (): Promise<void> => {
    try {
      setAddAccountError('')
      let newAccount: DerivedAccount
      const password = getSessionPassword()
      if (!password) throw new Error('Wallet is locked. Please log in again.')

      if (addAccountType === 'IMPORT_PK') {
        const pk =
          !importInput.startsWith('0x') && importInput.length === 64 ? '0x' + importInput : importInput
        newAccount = deriveAccountFromPrivateKey(pk, 'Imported Account')
        newAccount.encryptedKey = await encryptSecret(pk, password)
      } else if (addAccountType === 'IMPORT_SEED') {
        newAccount = deriveAccount(importInput, 0, 'Imported Seed Account')
        newAccount.encryptedKey = await encryptSecret(importInput, password)
      } else {
        return
      }

      const updatedAccounts = [...accounts, newAccount]
      await setSetting('accounts', updatedAccounts)
      setAccounts(updatedAccounts)

      await handleAccountSwitch(newAccount.address)
      setModalState('NONE')
    } catch (e) {
      setAddAccountError(e instanceof Error ? e.message : 'Failed to add account')
    }
  }

  const gasEstEth = TX_GAS_LIMIT * BigInt(sendGasPrice || '0')
  const gasEstFormatted = ethers.formatEther(gasEstEth)
  const totalDeducted =
    sendAmount && !isNaN(parseFloat(sendAmount))
      ? (parseFloat(sendAmount) + parseFloat(gasEstFormatted)).toFixed(6)
      : '0.00'

  return (
    <div className="flex flex-col h-full bg-slate-50/80 relative">
      <WalletHeader onAddAccount={() => setModalState('ADD_ACCOUNT')} />

      <main className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="flex gap-6 h-full">
          <AccountSidebar
            accounts={accounts}
            activeWalletAddress={activeWalletAddress}
            balances={balances}
            onAccountSwitch={handleAccountSwitch}
            onHideAccount={handleHideAccount}
            onDeriveAccount={handleHDDerivation}
            onImportWallet={() => {
              setModalState('ADD_ACCOUNT')
              useWalletUiStore.getState().setAddAccountType('IMPORT_PK')
            }}
            onManageHidden={() => setModalState('MANAGE_HIDDEN')}
          />

          <div className="flex-1 min-w-0 space-y-5">
            <AccountHeroCard
              activeAccount={activeAccount}
              activeGradient={activeGradient}
              balance={balance}
              copied={copied}
              onReceive={() => setModalState('RECEIVE')}
              onSend={() => setModalState('SEND')}
              onCopy={handleCopy}
            />

            <WalletTabs 
              activeWalletAddress={activeWalletAddress}
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
          </div>
        </div>
      </main>

      <WalletModals
        accounts={accounts}
        activeAccount={activeAccount}
        copied={copied}
        gasEstFormatted={gasEstFormatted}
        totalDeducted={totalDeducted}
        onClose={() => setModalState('NONE')}
        onCopy={handleCopy}
        onSend={handleSend}
        onImportAccount={handleCreateOrImportAccount}
        onUnhideAccount={handleUnhideAccount}
      />
    </div>
  )
}

export { Wallet }
