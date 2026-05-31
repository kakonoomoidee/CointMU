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
    price: '0.42', // Note: USD prices are no longer rendered in the UI
    change: '+2.4%',
    decimals: 18,
    colorClass: 'bg-blue-500'
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
      
      let decimals = 18
      try {
        const decimalsData = iface.encodeFunctionData('decimals', [])
        const decimalsResult = await call('eth_call', [{
          to: tokenContractAddress,
          data: decimalsData
        }, 'latest'])
        
        if (decimalsResult && decimalsResult !== '0x') {
          decimals = Number(iface.decodeFunctionResult('decimals', decimalsResult)[0])
        }
      } catch (err) {
        console.warn(`Failed to fetch decimals for ${tokenContractAddress}, defaulting to 18`, err)
      }
      
      return parseFloat(ethers.formatUnits(balanceBigInt, decimals)).toFixed(2)
    }
    return '0.00'
  } catch (error) {
    console.error(`Failed to fetch ERC20 balance for ${tokenContractAddress}`, error)
    return '0.00'
  }
}
