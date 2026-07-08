import { type JSX } from 'react'
import { useDappStore, useAppStore, useConnectedSitesStore, type DappRequest } from '@/store'
import { resolveApprovalResult } from '@/utils/dappRpcResolver'

const USER_REJECTED_CODE = 4001

/**
 * Formats a JSON-RPC method name into a human-readable label by splitting on
 * underscores and capitalising each word.
 * @param {string} method - The raw JSON-RPC method string (e.g. 'eth_sendTransaction').
 * @returns {string} A title-cased, space-separated label.
 */
function formatMethodLabel(method: string): string {
  return method
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Derives a human-readable origin label from the dApp request. Because the
 * browser extension does not currently forward the page URL, this function
 * returns the tab ID as a fallback identifier until origin forwarding is added.
 * @param {DappRequest} request - The pending dApp request.
 * @returns {string} A display string identifying the origin.
 */
function formatOrigin(request: DappRequest): string {
  return `Tab ${request.tabId}`
}

/**
 * Global floating modal that conditionally renders when a pending dApp JSON-RPC
 * request is waiting for user approval. The modal is mounted inside App.tsx so
 * it appears above all other UI regardless of the active view. It displays the
 * inferred origin, the JSON-RPC method, and the raw parameters, then lets the
 * user approve or reject the request. The response is sent back to the Electron
 * Main process via window.api.dapp.sendDappResponse, which routes it to the
 * browser extension and ultimately settles the dApp's pending EIP-1193 promise.
 * @returns {JSX.Element | null} The rendered modal, or null when no request is pending.
 */
function DappApprovalModal(): JSX.Element | null {
  const request = useDappStore((s) => s.pendingDappRequest)
  const clearPendingDappRequest = useDappStore((s) => s.clearPendingDappRequest)
  const activeAccount = useAppStore((s) => s.activeAccount)
  const addConnectedSite = useConnectedSitesStore((s) => s.addConnectedSite)

  if (!request) return null

  /**
   * Sends a rejection response (EIP-1193 error code 4001) to the Main process
   * and dismisses the modal.
   * @returns {void}
   */
  const handleReject = (): void => {
    window.api.dapp.sendDappResponse({
      id: request.id,
      tabId: request.tabId,
      approved: false
    })
    clearPendingDappRequest()
  }

  /**
   * Resolves the correct JSON-RPC result for the pending method, sends the
   * approval response to the Main process, and dismisses the modal.
   * @returns {Promise<void>}
   */
  const handleApprove = async (): Promise<void> => {
    if (request.method === 'eth_requestAccounts') {
      addConnectedSite(request.origin)
    }
    
    const result = await resolveApprovalResult(request.method, request.params, activeAccount)
    window.api.dapp.sendDappResponse({
      id: request.id,
      tabId: request.tabId,
      approved: true,
      result
    })
    clearPendingDappRequest()
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div className='relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden'>

        <div className='flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100'>
          <div>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-wide'>
              dApp Request
            </p>
            <p className='text-sm font-medium text-slate-600 mt-0.5'>
              {formatOrigin(request)}
            </p>
          </div>
          <div className='flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1'>
            <span className='w-1.5 h-1.5 rounded-full bg-amber-400' />
            <span className='text-xs font-semibold text-amber-700'>Pending</span>
          </div>
        </div>

        <div className='px-5 py-4 space-y-4'>
          <div>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5'>
              Method
            </p>
            <div className='rounded-lg bg-slate-50 border border-slate-100 px-3 py-2'>
              <span className='text-sm font-mono font-semibold text-slate-800'>
                {request.method}
              </span>
              <span className='ml-2 text-xs text-slate-400'>
                {formatMethodLabel(request.method)}
              </span>
            </div>
          </div>

          <div>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5'>
              Parameters
            </p>
            <pre className='rounded-lg bg-slate-950 text-slate-100 text-xs font-mono px-3 py-3 overflow-x-auto max-h-48 overflow-y-auto leading-relaxed'>
              {JSON.stringify(request.params, null, 2)}
            </pre>
          </div>

          <p className='text-xs text-slate-400 leading-relaxed'>
            A connected dApp is requesting to execute this operation through your CointMU wallet.
            Only approve requests from dApps you trust.
          </p>
        </div>

        <div className='flex gap-3 px-5 pb-5'>
          <button
            id='dapp-modal-reject'
            type='button'
            onClick={handleReject}
            className='flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors duration-150'
          >
            Reject
          </button>
          <button
            id='dapp-modal-approve'
            type='button'
            onClick={() => { void handleApprove() }}
            className='flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors duration-150 shadow-sm'
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}

export { DappApprovalModal }
export { USER_REJECTED_CODE }
