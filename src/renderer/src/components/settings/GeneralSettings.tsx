import type { JSX } from 'react'
import type { SettingsStore } from '@/views/Settings'

interface GeneralSettingsProps {
  config: SettingsStore['general']
  onUpdate: (key: string, value: any) => void
}

/**
 * General settings pane containing startup behaviors, notifications, and
 * display localization preferences.
 * @param props The configuration state and the update callback.
 * @returns The General Settings form component.
 */
export function GeneralSettings({ config, onUpdate }: GeneralSettingsProps): JSX.Element {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">Application behavior and default display</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Startup</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Launch CointMU at login</p>
                <p className="text-xs text-slate-500 mt-0.5">Open automatically when you sign in to your computer</p>
              </div>
              <button
                onClick={() => onUpdate('launchAtLogin', !config.launchAtLogin)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.launchAtLogin ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.launchAtLogin ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Open in background</p>
                <p className="text-xs text-slate-500 mt-0.5">Start minimized so mining can run without a window</p>
              </div>
              <button
                onClick={() => onUpdate('openInBackground', !config.openInBackground)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.openInBackground ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.openInBackground ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Notifications</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Push notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Mining rewards, incoming transactions, chain alerts</p>
              </div>
              <button
                onClick={() => onUpdate('pushNotifications', !config.pushNotifications)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.pushNotifications ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Notification sound</p>
                <p className="text-xs text-slate-500 mt-0.5">Play a short tone when a block you mined is sealed</p>
              </div>
              <button
                onClick={() => onUpdate('notificationSound', !config.notificationSound)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.notificationSound ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.notificationSound ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Display</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Language</p>
                <p className="text-xs text-slate-500 mt-0.5">Application language</p>
              </div>
              <div className="relative">
                <select
                  value={config.language}
                  onChange={(e) => onUpdate('language', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Default currency</p>
                <p className="text-xs text-slate-500 mt-0.5">Used everywhere amounts are shown</p>
              </div>
              <div className="relative">
                <select
                  value={config.currency}
                  onChange={(e) => onUpdate('currency', e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option>CMU (native)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
