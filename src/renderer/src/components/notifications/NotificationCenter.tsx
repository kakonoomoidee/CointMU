import { type JSX, useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationStore, type NotificationItem, type NotificationType } from '@/store'
import { IconBell } from '@/assets/icons'

const DOT_BY_TYPE: Record<NotificationType, string> = {
  transaction: 'bg-blue-500',
  mining: 'bg-emerald-500',
  security: 'bg-red-500',
  info: 'bg-slate-400'
}

interface NotificationRowProps {
  notification: NotificationItem
  onSelect: (id: string) => void
}

/**
 * A single notification row in the center list. Unread rows carry a tinted
 * background and a leading colored dot, and selecting one marks it read.
 * @param props - The notification item and the select handler.
 * @returns The rendered notification row.
 */
function NotificationRow({ notification, onSelect }: NotificationRowProps): JSX.Element {
  return (
    <button
      onClick={() => onSelect(notification.id)}
      className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${
        notification.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50'
      }`}
    >
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${DOT_BY_TYPE[notification.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-800 truncate">{notification.title}</p>
          {!notification.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 break-words">{notification.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </button>
  )
}

/**
 * Notification center trigger and popover. Renders a bell button with an unread
 * count badge; clicking it opens a downward dropdown listing the persisted
 * notification history with mark-all-read and clear-all actions. Uses an
 * outside-click handler to close, matching the existing sidebar popover pattern.
 * @returns The notification center control.
 */
export function NotificationCenter(): JSX.Element {
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const clearAll = useNotificationStore((s) => s.clearAll)

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <IconBell width={18} height={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-full top-0 ml-4 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">Notifications</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mark all read
              </button>
              <button
                onClick={() => clearAll()}
                disabled={notifications.length === 0}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onSelect={markAsRead}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconBell className="text-slate-300 mb-2" width={28} height={28} strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-400">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">Events will appear here as they happen</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
