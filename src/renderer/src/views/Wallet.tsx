import { useState, useEffect, type JSX } from 'react'
import { deriveAccount, generateIdenticonGradient, deriveAccountFromPrivateKey, type DerivedAccount } from '@/services'
import { QRCodeSVG } from 'qrcode.react'
import { ethers } from 'ethers'
import { call } from '@/services'

type WalletTab = 'activity' | 'tokens' | 'nfts'
type ModalState = 'NONE' | 'RECEIVE' | 'SEND' | 'ADD_ACCOUNT' | 'MANAGE_HIDDEN'

const WALLET_TABS = [
  { id: 'activity' as const, label: 'Activity' },
  { id: 'tokens' as const, label: 'Tokens' },
  { id: 'nfts' as const, label: 'NFTs' }
]

interface WalletProps {
  accounts: DerivedAccount[]
  setAccounts: (accounts: DerivedAccount[]) => void
  activeWalletAddress: string | null
  setActiveWalletAddress: (address: string) => void
  balance: string
}

const WATCH_LIST: never[] = []
const TRANSACTIONS: never[] = []

/**
 * Comprehensive wallet management view with a split-pane layout featuring
 * an accounts sidebar, a hero card displaying the selected account details
 * with action buttons, and a tabbed content area switching between Activity
 * (transaction history), Tokens (ERC-20 balances table), and NFTs (ERC-721/1155
 * card grid).
 * @returns The complete wallet view with account list, hero card, and tabbed content.
 */
function Wallet({
  accounts,
  setAccounts,
  activeWalletAddress,
  setActiveWalletAddress,
  balance
}: WalletProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<WalletTab>('activity')
  const [modalState, setModalState] = useState<ModalState>('NONE')
  const [copied, setCopied] = useState(false)

  // Send state
  const [sendTo, setSendTo] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendGasPrice, setSendGasPrice] = useState('0')
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sendSuccess, setSendSuccess] = useState('')

  // Add Account state
  const [addAccountType, setAddAccountType] = useState<'SELECT' | 'CREATE' | 'IMPORT_SEED' | 'IMPORT_PK'>('SELECT')
  const [importInput, setImportInput] = useState('')
  const [addAccountError, setAddAccountError] = useState('')

  const activeAccount = accounts.find(a => a.address === activeWalletAddress) || accounts[0]
  const activeGradient = activeAccount ? generateIdenticonGradient(activeAccount.address) : 'from-slate-400 to-slate-500'

  useEffect(() => {
    if (modalState === 'SEND') {
      setSendTo('')
      setSendAmount('')
      setSendError('')
      setSendSuccess('')
      setSendLoading(false)
      call('eth_gasPrice', []).then(price => {
        if (price) setSendGasPrice(price)
      })
    } else if (modalState === 'ADD_ACCOUNT') {
      setAddAccountType('SELECT')
      setImportInput('')
      setAddAccountError('')
    }
    setCopied(false)
  }, [modalState])

  const handleAccountSwitch = async (address: string): Promise<void> => {
    await window.api.settings.set('activeWalletAddress', address)
    setActiveWalletAddress(address)
  }

  const handleHideAccount = async (e: React.MouseEvent, address: string) => {
    e.stopPropagation()
    if (address === activeWalletAddress) {
      return
    }
    const updatedAccounts = accounts.map(acc => 
      acc.address === address ? { ...acc, isHidden: true } : acc
    )
    await window.api.settings.set('accounts', updatedAccounts)
    setAccounts(updatedAccounts)
  }

  const handleUnhideAccount = async (address: string) => {
    const updatedAccounts = accounts.map(acc => 
      acc.address === address ? { ...acc, isHidden: false } : acc
    )
    await window.api.settings.set('accounts', updatedAccounts)
    setAccounts(updatedAccounts)
  }

  const handleCopy = () => {
    if (activeAccount?.address) {
      navigator.clipboard.writeText(activeAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSend = async () => {
    if (!sendTo || !sendAmount) {
      setSendError('Please fill in all fields')
      return
    }

    try {
      setSendError('')
      setSendLoading(true)
      
      let wallet
      if (activeAccount.encryptedKey) {
        const decodedAcc = atob(activeAccount.encryptedKey)
        const accSecret = decodedAcc.split(':')[0]
        wallet = new ethers.Wallet(accSecret)
      } else {
        const encryptedPayload = await window.api.settings.get('encryptedPayload')
        if (!encryptedPayload) throw new Error('Wallet is not unlocked')
        
        const decoded = atob(encryptedPayload)
        const secretKey = decoded.split(':')[0]
        
        if (secretKey.split(' ').length === 12) {
           wallet = ethers.HDNodeWallet.fromPhrase(secretKey, undefined, `m/44'/60'/0'/0/${activeAccount.index}`)
        } else {
           wallet = new ethers.Wallet(secretKey)
        }
      }

      const nonceHex = await call('eth_getTransactionCount', [activeAccount.address, 'latest'])
      const chainIdHex = await call('eth_chainId', [])
      
      const tx = {
        to: sendTo,
        value: ethers.parseEther(sendAmount),
        gasLimit: 21000n,
        gasPrice: BigInt(sendGasPrice),
        nonce: parseInt(nonceHex, 16),
        chainId: parseInt(chainIdHex, 16)
      }

      const signedTx = await wallet.signTransaction(tx)
      const txHash = await call('eth_sendRawTransaction', [signedTx])
      
      if (txHash && txHash.startsWith('0x')) {
         setSendSuccess(txHash)
         setSendTo('')
         setSendAmount('')
      } else {
         throw new Error('Transaction failed')
      }
    } catch (e: any) {
      setSendError(e.message || 'Failed to send transaction')
    } finally {
      setSendLoading(false)
    }
  }

  const handleHDDerivation = async () => {
    try {
      const encryptedPayload = await window.api.settings.get('encryptedPayload')
      if (!encryptedPayload) throw new Error('Not unlocked')
      
      const decoded = atob(encryptedPayload)
      const secretKey = decoded.split(':')[0]
      const password = decoded.split(':')[1]
      const newIndex = accounts.length
      
      let newAccount: DerivedAccount
      if (secretKey.split(' ').length === 12) {
        newAccount = deriveAccount(secretKey, newIndex, `Account ${newIndex + 1}`)
      } else {
        const { Wallet } = ethers
        const randomWallet = Wallet.createRandom()
        newAccount = deriveAccountFromPrivateKey(randomWallet.privateKey, `Account ${newIndex + 1}`)
        newAccount.encryptedKey = btoa(randomWallet.privateKey + ':' + password)
      }

      const updatedAccounts = [...accounts, newAccount]
      await window.api.settings.set('accounts', updatedAccounts)
      setAccounts(updatedAccounts)
      await handleAccountSwitch(newAccount.address)
    } catch (e: any) {
      console.error('HD Derivation Error:', e)
    }
  }

  const handleCreateOrImportAccount = async () => {
    try {
      setAddAccountError('')
      let newAccount: DerivedAccount
      const encryptedPayload = await window.api.settings.get('encryptedPayload')
      if (!encryptedPayload) throw new Error('Not unlocked')
      
      const decoded = atob(encryptedPayload)
      const password = decoded.split(':')[1]

      if (addAccountType === 'IMPORT_PK') {
         const pk = (!importInput.startsWith('0x') && importInput.length === 64) ? '0x' + importInput : importInput
         newAccount = deriveAccountFromPrivateKey(pk, `Imported Account`)
         newAccount.encryptedKey = btoa(pk + ':' + password)
      } else if (addAccountType === 'IMPORT_SEED') {
         newAccount = deriveAccount(importInput, 0, `Imported Seed Account`)
         newAccount.encryptedKey = btoa(importInput + ':' + password)
      } else {
         return
      }

      const updatedAccounts = [...accounts, newAccount]
      await window.api.settings.set('accounts', updatedAccounts)
      setAccounts(updatedAccounts)
      
      await handleAccountSwitch(newAccount.address)
      setModalState('NONE')
    } catch (e: any) {
      setAddAccountError(e.message || 'Failed to add account')
    }
  }

  const gasEstEth = (21000n * BigInt(sendGasPrice || '0'))
  const gasEstFormatted = ethers.formatEther(gasEstEth)
  const totalDeducted = sendAmount && !isNaN(parseFloat(sendAmount)) ? (parseFloat(sendAmount) + parseFloat(gasEstFormatted)).toFixed(6) : '0.00'

  return (
    <div className="flex flex-col h-full bg-slate-50/80 relative">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">Wallet</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">Synced</span>
          </div>

          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Backup
          </button>

          <button 
            onClick={() => setModalState('ADD_ACCOUNT')}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New account
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="flex gap-6 h-full">
          <div className="w-64 flex-shrink-0 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">Accounts</h3>
                <button onClick={handleHDDerivation} className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                {accounts.filter(a => !a.isHidden).map((acc, i) => {
                  const gradient = generateIdenticonGradient(acc.address)
                  const abbrAddress = `${acc.address.substring(0, 6)}...${acc.address.substring(acc.address.length - 4)}`
                  const isSelected = acc.address === activeWalletAddress

                  return (
                    <button
                      key={i}
                      onClick={() => handleAccountSwitch(acc.address)}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 relative ${
                        isSelected
                          ? 'bg-white border border-slate-200 shadow-sm'
                          : 'hover:bg-white/60 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700 truncate">{acc.label}</p>
                          <p className="text-xs font-bold text-slate-800 ml-2 group-hover:opacity-0 transition-opacity">{isSelected ? balance : '0.00'}</p>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[10px] text-slate-400 font-mono truncate" title={acc.address}>{abbrAddress}</p>
                          <p className="text-[10px] text-slate-400 group-hover:opacity-0 transition-opacity">CMU</p>
                        </div>
                      </div>
                      
                      {!isSelected && (
                        <div 
                          onClick={(e) => handleHideAccount(e, acc.address)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
                          title="Hide account"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">Watch List</h3>
              <div className="space-y-2">
                {WATCH_LIST.length > 0 ? WATCH_LIST.map((_, i) => (
                  <div key={i} />
                )) : (
                  <p className="text-xs text-slate-400 px-3 py-2">No watched addresses</p>
                )}
              </div>
            </div>

            <button onClick={() => {setModalState('ADD_ACCOUNT'); setAddAccountType('IMPORT_PK')}} className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors py-2">
              + Import wallet
            </button>
            <button onClick={() => setModalState('MANAGE_HIDDEN')} className="w-full text-center text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors py-1">
              Manage hidden accounts
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950 p-7 text-white relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/3 blur-sm" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeGradient}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{activeAccount?.label}</p>
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-white/50 bg-white/10 px-1.5 py-0.5 rounded">EOA</span>
                      </div>
                      <p className="text-xs text-white/50 font-mono mt-0.5">{activeAccount?.address}</p>
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-lg bg-white p-1.5 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setModalState('RECEIVE')}>
                    {activeAccount?.address ? (
                      <QRCodeSVG value={activeAccount.address} className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:6px_6px] rounded-sm" />
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-4xl font-bold tracking-tight">{balance}</span>
                    <span className="text-lg font-semibold text-white/60">CMU</span>
                  </div>
                  <p className="text-sm text-white/40 mt-1">Balance from node</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button onClick={() => setModalState('SEND')} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 11 12 6 7 11" />
                      <line x1="12" y1="6" x2="12" y2="18" />
                    </svg>
                    Send
                  </button>
                  <button onClick={() => setModalState('RECEIVE')} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="7 13 12 18 17 13" />
                      <line x1="12" y1="6" x2="12" y2="18" />
                    </svg>
                    Receive
                  </button>
                  <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 014-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 01-4 4H3" />
                    </svg>
                    Swap
                  </button>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {copied ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </>
                      )}
                    </svg>
                    {copied ? 'Copied!' : 'Copy address'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-slate-100/50">
                  {WALLET_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                        activeTab === tab.id
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'activity' && (
                <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
                  {TRANSACTIONS.length > 0 ? TRANSACTIONS.map((_, i) => (
                    <div key={i} />
                  )) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <svg className="text-slate-300 mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <p className="text-sm font-medium text-slate-400">No activity yet</p>
                      <p className="text-xs text-slate-400 mt-1">Transactions will appear here once you send or receive CMU</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tokens' && (
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">Token</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold tracking-wider uppercase text-slate-400">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td colSpan={2} className="py-16 text-center">
                          <p className="text-sm font-medium text-slate-400">No tokens detected</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'nfts' && (
                <div className="rounded-2xl bg-white border border-slate-200">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm font-medium text-slate-400">No NFTs found</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {modalState !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden relative">
            <button onClick={() => setModalState('NONE')} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {modalState === 'RECEIVE' && (
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Receive CMU</h3>
                <p className="text-sm text-slate-500 mb-8">Scan this QR code or copy the address below to receive funds.</p>
                
                <div className="mx-auto w-56 h-56 bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm mb-8 flex items-center justify-center">
                  {activeAccount?.address && <QRCodeSVG value={activeAccount.address} className="w-full h-full" />}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Your Address</p>
                  <p className="text-sm font-mono text-slate-800 break-all">{activeAccount?.address}</p>
                </div>

                <button onClick={handleCopy} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {copied ? (
                      <polyline points="20 6 9 17 4 12" />
                    ) : (
                      <>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </>
                    )}
                  </svg>
                  {copied ? 'Address Copied!' : 'Copy Address'}
                </button>
              </div>
            )}

            {modalState === 'SEND' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Send CMU</h3>
                <p className="text-sm text-slate-500 mb-8">Transfer funds to another address.</p>
                
                {sendSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-800 mb-2">Transaction Sent!</p>
                    <p className="text-sm text-slate-500 mb-4 break-all font-mono">Hash: {sendSuccess}</p>
                    <button onClick={() => setModalState('NONE')} className="w-full py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">To Address</label>
                      <input 
                        type="text" 
                        value={sendTo}
                        onChange={(e) => setSendTo(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Amount</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm"
                        />
                        <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-400">CMU</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Network Fee (Est.)</span>
                        <span className="text-xs font-mono font-bold text-slate-700">{gasEstFormatted} CMU</span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800">Total Deducted</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{totalDeducted} CMU</span>
                      </div>
                    </div>

                    {sendError && (
                      <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{sendError}</p>
                    )}

                    <button 
                      onClick={handleSend}
                      disabled={sendLoading}
                      className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                      {sendLoading ? 'Signing & Broadcasting...' : 'Review & Sign'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {modalState === 'ADD_ACCOUNT' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Add Account</h3>
                <p className="text-sm text-slate-500 mb-8">Import an existing seed phrase or private key.</p>

                {addAccountType === 'SELECT' && (
                  <div className="space-y-3">
                    <button onClick={() => setAddAccountType('IMPORT_SEED')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Import Seed Phrase</p>
                        <p className="text-xs text-slate-500">Restore an account from a 12-word seed.</p>
                      </div>
                    </button>
                    <button onClick={() => setAddAccountType('IMPORT_PK')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Import Private Key</p>
                        <p className="text-xs text-slate-500">Import a standalone hex private key.</p>
                      </div>
                    </button>
                  </div>
                )}

                {(addAccountType === 'IMPORT_SEED' || addAccountType === 'IMPORT_PK') && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        {addAccountType === 'IMPORT_SEED' ? '12-Word Seed Phrase' : 'Private Key (Hex)'}
                      </label>
                      <textarea 
                        value={importInput}
                        onChange={(e) => setImportInput(e.target.value)}
                        placeholder={addAccountType === 'IMPORT_SEED' ? 'word1 word2...' : '0x...'}
                        rows={3}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm resize-none"
                      />
                    </div>

                    {addAccountError && (
                      <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{addAccountError}</p>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => setAddAccountType('SELECT')} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        Back
                      </button>
                      <button onClick={handleCreateOrImportAccount} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors">
                        Import
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {modalState === 'MANAGE_HIDDEN' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Hidden Accounts</h3>
                <p className="text-sm text-slate-500 mb-8">Restore accounts to your active sidebar.</p>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {accounts.filter(a => a.isHidden).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No hidden accounts.</p>
                  ) : (
                    accounts.filter(a => a.isHidden).map((acc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="text-sm font-bold text-slate-800 truncate">{acc.label}</p>
                          <p className="text-xs font-mono text-slate-500 truncate">{acc.address}</p>
                        </div>
                        <button 
                          onClick={() => handleUnhideAccount(acc.address)}
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm"
                          title="Unhide account"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { Wallet }
