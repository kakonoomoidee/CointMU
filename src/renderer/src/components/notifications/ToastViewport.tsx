import { type JSX, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNotificationStore, type NotificationItem, type NotificationType } from '@/store'
import { IconX } from '@/assets/icons'

const TOAST_DURATION_MS = 5000

const ACCENT_BY_TYPE: Record<NotificationType, string> = {
  transaction: 'bg-blue-500',
  mining: 'bg-emerald-500',
  security: 'bg-red-500',
  info: 'bg-slate-400'
}

interface ToastCardProps {
  toast: NotificationItem
  onDismiss: (id: string) => void
}

/**
 * A single auto-dismissing toast card. Schedules its own removal on mount and
 * clears the timer if it is dismissed manually or unmounted first.
 * @param props - The toast item and the dismiss handler.
 * @returns The rendered toast card.
 */
function ToastCard({ toast, onDismiss }: ToastCardProps): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl shadow-lg p-4 animate-in fade-in slide-in-from-right-4 duration-200">
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${ACCENT_BY_TYPE[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800">{toast.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <IconX width={16} height={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}

/**
 * Fixed top-right stack of transient in-app toasts rendered through a portal so
 * it overlays the entire window regardless of the active view. Reads the toast
 * queue from the notification store and renders nothing when it is empty.
 * @returns The toast portal, or null when there are no toasts.
 */
export function ToastViewport(): JSX.Element | null {
  const toasts = useNotificationStore((s) => s.toasts)
  const dismissToast = useNotificationStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body
  )
}
