import { useState, useEffect } from 'react'

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready'

export interface UpdateState {
  status: UpdateStatus
  percent: number
}

/**
 * Subscribes to the Electron auto-updater IPC bridge and exposes reactive
 * update lifecycle state to any consuming React component.
 * @returns {UpdateState} The current update status and download progress percentage.
 */
export function useUpdateStatus(): UpdateState {
  const [state, setState] = useState<UpdateState>({ status: 'idle', percent: 0 })

  useEffect(() => {
    if (!window.api?.updater?.onUpdateStatus) {
      return
    }

    const unsubscribe = window.api.updater.onUpdateStatus((payload) => {
      setState({
        status: (payload.status as UpdateStatus) || 'idle',
        percent: payload.percent ?? 0
      })
    })

    return unsubscribe
  }, [])

  return state
}
