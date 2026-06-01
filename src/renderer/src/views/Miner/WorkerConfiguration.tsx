import { type JSX } from 'react'
import { Card } from '@/components'
import { generateIdenticonGradient } from '@/services'

const INTENSITY_OPTIONS = ['Eco', 'Balanced', 'Turbo'] as const

interface WorkerConfigurationProps {
  cpuThreads: number
  maxCores: number
  intensity: string
  rewardAddress: string
}

/**
 * Read-only summary of the internal node worker configuration: allocated worker
 * threads, mining intensity, and the reward address that receives block rewards.
 * @param props - Thread allocation, core count, intensity, and reward address.
 * @returns The rendered worker configuration card.
 */
function WorkerConfiguration({
  cpuThreads,
  maxCores,
  intensity,
  rewardAddress
}: WorkerConfigurationProps): JSX.Element {
  return (
    <Card>
      <div className="mb-1">
        <h3 className="text-sm font-bold text-slate-800">Worker configuration</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Current internal node configuration</p>
      </div>

      <div className="divide-y divide-slate-100 mt-4 opacity-80 pointer-events-none">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Worker threads</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {cpuThreads} of {maxCores} cores
            </p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: maxCores }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-6 rounded-sm cursor-default ${i < cpuThreads ? 'bg-emerald-400' : 'bg-slate-200'}`}
                title={`${i + 1} Thread${i === 0 ? '' : 's'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Intensity</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-[140px]">
              Higher = more heat, faster solves
            </p>
          </div>
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
            {INTENSITY_OPTIONS.map((option) => (
              <div
                key={option}
                className={`px-3.5 py-1.5 text-xs font-semibold cursor-default transition-colors ${
                  intensity === option ? 'bg-slate-300 text-slate-700' : 'bg-white text-slate-400'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Reward address</p>
            <p className="text-xs text-slate-400 mt-0.5">Block rewards are credited here</p>
          </div>
          {rewardAddress ? (
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-br ${generateIdenticonGradient(rewardAddress)} flex-shrink-0`}
              />
              <span className="text-xs font-mono text-slate-500 font-medium tracking-tight">
                {rewardAddress.substring(0, 10)}...{rewardAddress.substring(rewardAddress.length - 8)}
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-400">Set in Mining Settings</span>
          )}
        </div>
      </div>
    </Card>
  )
}

export { WorkerConfiguration }
export type { WorkerConfigurationProps }
