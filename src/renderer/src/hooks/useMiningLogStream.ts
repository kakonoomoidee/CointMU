import { useEffect } from 'react'
import { subscribeMiningLog } from '@/services'
import { useMiningStore } from '@/store'

/**
 * Subscribes to the parsed Geth mining log stream for the lifetime of the
 * component and appends every entry to the global mining store. Mounting this
 * once at the application root ensures logs accumulate regardless of which view
 * is active, so the terminal reflects the full session history.
 * @returns Nothing.
 */
function useMiningLogStream(): void {
  useEffect(() => {
    return subscribeMiningLog((log) => {
      useMiningStore.getState().addMiningLog(log)
    })
  }, [])
}

export { useMiningLogStream }
