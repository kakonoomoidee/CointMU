import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchBalance } from '@/services/rpcClient'

const BALANCE_POLL_INTERVAL_MS = 5000
const BALANCE_INITIAL_DELAY_MS = 200
const DISCONNECTED_BALANCE = '0.00'

interface BalancesState {
  balances: Record<string, string>
  loading: boolean
}

/**
 * Custom hook that concurrently polls wallet balances for multiple addresses
 * from the remote Core-geth node using Promise.all. Returns a reactive dictionary
 * mapping addresses to their formatted CMU balance strings.
 * @param addresses - The list of wallet addresses to query.
 * @param isConnected - Whether the RPC node is currently reachable.
 * @returns A reactive BalancesState object with the mapped balance strings.
 */
function useBalances(addresses: string[], isConnected: boolean): BalancesState {
  const [state, setState] = useState<BalancesState>({ balances: {}, loading: true })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Memoize addresses to prevent continuous re-polling if the array reference changes
  const addressesKey = addresses.join(',')

  const poll = useCallback(async (): Promise<void> => {
    if (!addresses.length || !isConnected) {
      const emptyBalances = addresses.reduce((acc, addr) => {
        acc[addr] = DISCONNECTED_BALANCE
        return acc
      }, {} as Record<string, string>)
      setState({ balances: emptyBalances, loading: false })
      return
    }

    try {
      const results = await Promise.all(
        addresses.map(async (addr) => {
          const res = await fetchBalance(addr)
          return { addr, res }
        })
      )
      
      const newBalances = results.reduce((acc, { addr, res }) => {
        acc[addr] = res !== null ? res : DISCONNECTED_BALANCE
        return acc
      }, {} as Record<string, string>)
      
      setState({ balances: newBalances, loading: false })
    } catch {
      // Silent catch to preserve existing balances on transient network errors
    }
  }, [addressesKey, isConnected])

  useEffect(() => {
    if (!addresses.length || !isConnected) {
      poll()
      return
    }

    const initialTimer = setTimeout(() => {
      poll()
    }, BALANCE_INITIAL_DELAY_MS)

    intervalRef.current = setInterval(poll, BALANCE_POLL_INTERVAL_MS)

    return (): void => {
      clearTimeout(initialTimer)
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [addressesKey, isConnected, poll])

  return state
}

export { useBalances }
export type { BalancesState }
