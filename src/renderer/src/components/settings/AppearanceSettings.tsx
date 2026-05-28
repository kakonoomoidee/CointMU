import type { JSX } from 'react'
import type { SettingsStore } from '@/views/Settings'

interface AppearanceSettingsProps {
  config: SettingsStore['appearance']
  onUpdate: (key: string, value: any) => void
}

const COLORS = [
  { id: '#3b82f6', color: 'bg-blue-500', name: 'blue' },
  { id: '#10b981', color: 'bg-emerald-500', name: 'emerald' },
  { id: '#6366f1', color: 'bg-indigo-500', name: 'indigo' },
  { id: '#a855f7', color: 'bg-purple-500', name: 'purple' },
  { id: '#f59e0b', color: 'bg-amber-500', name: 'amber' },
  { id: '#ef4444', color: 'bg-red-500', name: 'red' }
]

/**
 * Appearance settings pane containing theme (light/dark/auto),
 * accent color selection, and layout density configurations.
 * @param props The configuration state and the update callback.
 * @returns The Appearance Settings form component.
 */
export function AppearanceSettings({ config, onUpdate }: AppearanceSettingsProps): JSX.Element {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-6">Customize how CointMU looks</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Theme</h3>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex gap-4">
            
            <button
              onClick={() => onUpdate('theme', 'Light')}
              className={`flex-1 rounded-xl border-2 transition-all p-1 text-left ${
                config.theme === 'Light' ? 'border-blue-500 bg-blue-50/50' : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden h-24 mb-3 flex">
                <div className="w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col pt-3 pl-3">
                   <div className="w-4 h-1 rounded-full bg-blue-500 mb-1" />
                   <div className="w-8 h-1 rounded-full bg-slate-300 mb-0.5" />
                   <div className="w-6 h-1 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 bg-white p-3">
                  <div className="w-12 h-2 rounded-full bg-slate-100 mb-2" />
                  <div className="w-8 h-1 rounded-full bg-slate-100" />
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 px-2">Light</span>
            </button>

            <button
              onClick={() => onUpdate('theme', 'Dark')}
              className={`flex-1 rounded-xl border-2 transition-all p-1 text-left ${
                config.theme === 'Dark' ? 'border-blue-500 bg-blue-50/50' : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden h-24 mb-3 flex">
                <div className="w-1/3 bg-slate-800 border-r border-slate-700 flex flex-col pt-3 pl-3">
                   <div className="w-4 h-1 rounded-full bg-blue-500 mb-1" />
                   <div className="w-8 h-1 rounded-full bg-slate-600 mb-0.5" />
                   <div className="w-6 h-1 rounded-full bg-slate-700" />
                </div>
                <div className="flex-1 bg-slate-900 p-3">
                  <div className="w-12 h-2 rounded-full bg-slate-800 mb-2" />
                  <div className="w-8 h-1 rounded-full bg-slate-800" />
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 px-2">Dark</span>
            </button>

            <button
              onClick={() => onUpdate('theme', 'Auto')}
              className={`flex-1 rounded-xl border-2 transition-all p-1 text-left ${
                config.theme === 'Auto' ? 'border-blue-500 bg-blue-50/50' : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden h-24 mb-3 flex relative">
                 <div className="absolute inset-0 flex">
                   <div className="flex-1 bg-white" />
                   <div className="flex-1 bg-slate-900" />
                 </div>
                 {/* Diagonal cut abstraction */}
                 <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-slate-900 origin-bottom-right transform -skew-x-12 translate-x-1/4" />
                 </div>
                 <div className="relative z-10 w-1/3 bg-slate-50 border-r border-slate-200/50 flex flex-col pt-3 pl-3">
                   <div className="w-4 h-1 rounded-full bg-blue-500 mb-1" />
                   <div className="w-8 h-1 rounded-full bg-slate-300 mb-0.5" />
                   <div className="w-6 h-1 rounded-full bg-slate-200" />
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 px-2">Auto</span>
            </button>

          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Accent Color</h3>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => onUpdate('accentColor', c.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  config.accentColor === c.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110'
                }`}
              >
                <div className={`w-full h-full rounded-full ${c.color}`} />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Layout</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Density</p>
                <p className="text-xs text-slate-500 mt-0.5">Vertical spacing in lists and tables</p>
              </div>
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                {['Compact', 'Comfortable', 'Spacious'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onUpdate('density', opt)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      config.density === opt
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Show sidebar icons in color</p>
                <p className="text-xs text-slate-500 mt-0.5">Accent network items by color in the sidebar</p>
              </div>
              <button
                onClick={() => onUpdate('showSidebarColors', !config.showSidebarColors)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.showSidebarColors ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.showSidebarColors ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Animated transitions</p>
                <p className="text-xs text-slate-500 mt-0.5">Smooth page changes and motion</p>
              </div>
              <button
                onClick={() => onUpdate('animatedTransitions', !config.animatedTransitions)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${config.animatedTransitions ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.animatedTransitions ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
