import type { JSX } from 'react'
import { useNotificationStore } from '@/store'

interface ToggleRowProps {
  title: string
  description: string
  value: boolean
  onChange: () => void
}

/**
 * A single labeled toggle row using the shared pill-switch styling.
 * @param props - The label, description, current value, and change handler.
 * @returns The rendered toggle row.
 */
function ToggleRow({ title, description, value, onChange }: ToggleRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

/**
 * Notifications settings pane. Self-contained: reads preferences from the
 * notification store and persists changes through its updateSettings action.
 * @returns The Notifications settings form component.
 */
export function NotificationSettings(): JSX.Element {
  const settings = useNotificationStore((s) => s.settings)
  const updateSettings = useNotificationStore((s) => s.updateSettings)

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">Alerts, delivery channels, and event categories</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Delivery</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <ToggleRow
              title="Global notifications"
              description="Master switch for all in-app and desktop notifications"
              value={settings.global}
              onChange={() => updateSettings({ global: !settings.global })}
            />
            <ToggleRow
              title="Desktop / OS notifications"
              description="Show native system notifications outside the app window"
              value={settings.desktopOs}
              onChange={() => updateSettings({ desktopOs: !settings.desktopOs })}
            />
            <ToggleRow
              title="Notification sound"
              description="Play a short tone when a notification arrives"
              value={settings.sound}
              onChange={() => updateSettings({ sound: !settings.sound })}
            />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Event categories</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <ToggleRow
              title="Transaction events"
              description="Sends, confirmations, and failed transactions"
              value={settings.transactions}
              onChange={() => updateSettings({ transactions: !settings.transactions })}
            />
            <ToggleRow
              title="Mining events"
              description="Blocks you seal and mining milestones"
              value={settings.mining}
              onChange={() => updateSettings({ mining: !settings.mining })}
            />
            <ToggleRow
              title="Security events"
              description="Wallet lock, key reveal, and other sensitive actions"
              value={settings.security}
              onChange={() => updateSettings({ security: !settings.security })}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
