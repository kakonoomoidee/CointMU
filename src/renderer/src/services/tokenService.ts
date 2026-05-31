import { call } from '@/services'
import { ethers } from 'ethers'

export interface TokenInfo {
  symbol: string
  name: string
  address: string
  price: string
  change: string
  decimals: number
  colorClass: string
}

export const KNOWN_TOKENS: TokenInfo[] = [
  {
    symbol: 'CMU',
    name: 'CointMU',
    address: 'native', // Special case for native coin
    price: '0.42',
    change: '+2.4%',
    decimals: 18,
    colorClass: 'bg-blue-500'
  },
  {
    symbol: 'mUSD',
    name: 'CointMU USD',
    address: '0x0000000000000000000000000000000000000001',
    price: '1.00',
    change: '+0.0%',
    decimals: 18,
    colorClass: 'bg-green-500'
  },
  {
    symbol: 'cREDU',
    name: 'Campus Edu Token',
    address: '0x0000000000000000000000000000000000000002',
    price: '0.12',
    change: '-1.1%',
    decimals: 18,
    colorClass: 'bg-orange-500'
  },
  {
    symbol: 'LP',
    name: 'CMU-mUSD LP',
    address: '0x0000000000000000000000000000000000000003',
    price: '18.30',
    change: '+5.7%',
    decimals: 18,
    colorClass: 'bg-purple-500'
  }
]

const ERC20_ABI = [
  { constant: true, inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], type: 'function' },
  { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], type: 'function' }
]

const iface = new ethers.Interface(ERC20_ABI)

/**
 * Retrieves the ERC-20 token balance for a specific wallet address.
 * @param walletAddress - The owner wallet address.
 * @param tokenContractAddress - The smart contract address of the ERC-20 token.
 * @returns A promise resolving to the token balance as a formatted string.
 */
export async function getTokenBalance(walletAddress: string, tokenContractAddress: string): Promise<string> {
  if (!walletAddress || !tokenContractAddress) return '0.00'
  
  try {
    const data = iface.encodeFunctionData('balanceOf', [walletAddress])
    const result = await call('eth_call', [{
      to: tokenContractAddress,
      data: data
    }, 'latest'])
    
    if (result && result !== '0x') {
      const decoded = iface.decodeFunctionResult('balanceOf', result)
      const balanceBigInt = decoded[0]
      // We assume 18 decimals for these mock tokens, but realistically we would call decimals()
      return parseFloat(ethers.formatUnits(balanceBigInt, 18)).toFixed(2)
    }
    return '0.00'
  } catch (error) {
    console.error(`Failed to fetch ERC20 balance for ${tokenContractAddress}`, error)
    return '0.00'
  }
}
