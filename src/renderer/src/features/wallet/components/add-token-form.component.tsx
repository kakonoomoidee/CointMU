import { useState, type JSX } from 'react'
import { ethers } from 'ethers'
import { TokenService, type TokenInfo } from '@/services/tokenService'
import { AlertCircle } from 'lucide-react'

interface AddTokenFormProps {
  onTokenAdded: () => void
}

/**
 * A form component to dynamically add custom ERC-20 tokens to the wallet.
 * Validates the contract address and probes the network for token metadata.
 * @param props - Form props including the onTokenAdded callback.
 * @returns The rendered token addition form.
 */
function AddTokenForm({ onTokenAdded }: AddTokenFormProps): JSX.Element {
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    
    if (!address) {
      setError('Please enter a token contract address')
      return
    }

    if (!ethers.isAddress(address)) {
      setError('Invalid Ethereum address format')
      return
    }

    setIsLoading(true)

    try {
      const details = await TokenService.fetchTokenDetails(address)
      if (!details || !details.symbol) {
        setError('Could not fetch token details. Ensure it is a valid ERC-20 contract on this network.')
        setIsLoading(false)
        return
      }

      TokenService.addToken(details as TokenInfo)
      setAddress('')
      onTokenAdded()
    } catch (err) {
      setError('An error occurred while adding the token')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-4">
        Add Custom Token
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Token Contract Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
            <AlertCircle width={14} height={14} className="flex-shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !address}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Add Token'}
        </button>
      </form>
    </div>
  )
}

export { AddTokenForm }
