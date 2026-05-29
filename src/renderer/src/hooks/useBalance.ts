import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchBalance } from '@/services/rpcClient'

const BALANCE_POLL_INTERVAL_MS = 5000
const BALANCE_INITIAL_DELAY_MS = 200
const DISCONNECTED_BALANCE = '0.00'

interface BalanceState {
  balance: string
  loading: boolean
}

const INITIAL_BALANCE_STATE: BalanceState = {
  balance: DISCONNECTED_BALANCE,
  loading: true
}

/**
 * Custom hook that polls the wallet balance for a given address from the
 * remote Core-geth node. Returns the formatted CMU balance string. When
 * the node is unreachable or isConnected is false, the balance resets to "0.00".
 * @param address - The wallet address to query. Polling begins only when non-null.
 * @param isConnected - Whether the RPC node is currently reachable.
 * @returns A reactive BalanceState object with the formatted balance string.
 */
function useBalance(address: string | null, isConnected: boolean): BalanceState {
  const [state, setState] = useState<BalanceState>(INITIAL_BALANCE_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async (): Promise<void> => {
    if (address === null || !isConnected) {
      setState({ balance: DISCONNECTED_BALANCE, loading: false })
      return
    }

    try {
      const result = await fetchBalance(address)
      setState({
        balance: result !== null ? result : DISCONNECTED_BALANCE,
        loading: false
      })
    } catch {
      setState({ balance: DISCONNECTED_BALANCE, loading: false })
    }
  }, [address, isConnected])

  useEffect(() => {
    if (address === null || !isConnected) {
      setState({ balance: DISCONNECTED_BALANCE, loading: false })
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
  }, [address, isConnected, poll])

  return state
}

export { useBalance }
export type { BalanceState }
