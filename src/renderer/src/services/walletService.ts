import { Wallet, HDNodeWallet } from 'ethers'

export interface DerivedAccount {
  index: number
  address: string
  label: string
  encryptedKey?: string
  isHidden?: boolean
}

const GRADIENTS = [
  'from-emerald-400 to-emerald-600',
  'from-blue-400 to-blue-600',
  'from-violet-400 to-fuchsia-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-teal-500',
  'from-lime-400 to-emerald-500',
  'from-indigo-400 to-purple-500',
  'from-red-400 to-orange-500',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-pink-500',
  'from-teal-400 to-emerald-600'
]

/**
 * Generates a new 12-word BIP39 mnemonic seed phrase.
 * @returns The mnemonic phrase string.
 */
export function generateMnemonic(): string {
  const wallet = Wallet.createRandom()
  return wallet.mnemonic!.phrase
}

/**
 * Derives an Ethereum account from a given mnemonic and index
 * using the standard BIP44 derivation path (m/44'/60'/0'/0/i).
 * @param mnemonic - The BIP39 seed phrase.
 * @param index - The account index to derive.
 * @param label - A user-friendly label for the account.
 * @returns The derived account details.
 */
export function deriveAccount(mnemonic: string, index: number, label: string): DerivedAccount {
  const path = `m/44'/60'/0'/0/${index}`
  const hdNode = HDNodeWallet.fromPhrase(mnemonic, undefined, path)
  
  return {
    index,
    address: hdNode.address,
    label
  }
}

/**
 * Derives an Ethereum account from a raw private key.
 * @param privateKey - The hex-encoded private key.
 * @param label - A user-friendly label for the account.
 * @returns The derived account details.
 */
export function deriveAccountFromPrivateKey(privateKey: string, label: string): DerivedAccount {
  const wallet = new Wallet(privateKey)
  
  return {
    index: 0,
    address: wallet.address,
    label
  }
}

/**
 * Deterministically generates a Tailwind gradient class string based on an Ethereum address.
 * @param address - The Ethereum address.
 * @returns A Tailwind gradient class string.
 */
export function generateIdenticonGradient(address: string): string {
  // Simple hash of the address string to pick a gradient
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Ensure positive index
  const index = Math.abs(hash) % GRADIENTS.length
  return GRADIENTS[index]
}
