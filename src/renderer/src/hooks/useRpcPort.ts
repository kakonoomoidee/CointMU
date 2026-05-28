import { useState, useEffect } from 'react'

const RPC_PORT_FALLBACK = 8585

/**
 * Custom hook that fetches the dynamically resolved RPC port from the Electron
 * main process via the IPC bridge on component mount.
 * @returns An object containing the resolved port number and loading state.
 */
function useRpcPort(): { port: number | null; loading: boolean } {
  const [port, setPort] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false

    async function fetchPort(): Promise<void> {
      try {
        const resolvedPort = await window.api.getRpcPort()
        if (!cancelled) {
          setPort(resolvedPort)
        }
      } catch {
        if (!cancelled) {
          setPort(RPC_PORT_FALLBACK)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPort()

    return (): void => {
      cancelled = true
    }
  }, [])

  return { port, loading }
}

export { useRpcPort }
