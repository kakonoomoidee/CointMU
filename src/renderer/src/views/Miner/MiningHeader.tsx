import { type JSX } from 'react'
import { Button, StatusPill } from '@/components'
import { IconSettings } from '@/assets/icons'

interface MiningHeaderProps {
  isMining: boolean
  powerStatus: string
}

/**
 * Mining view header showing the workspace breadcrumb, the live mining status
 * pill, and the preferences action.
 * @param props - The current mining flag and node power status.
 * @returns The rendered mining header.
 */
function MiningHeader({ isMining, powerStatus }: MiningHeaderProps): JSX.Element {
  return (
    <header className="flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
          Workspace
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">Mining</span>
      </div>

      <div className="flex items-center gap-3">
        {isMining ? (
          <StatusPill tone="success" label="Mining" pulse />
        ) : powerStatus === 'Paused (Battery)' ? (
          <StatusPill tone="warning" label={powerStatus} />
        ) : (
          <StatusPill tone="neutral" label="Stopped" showDot={false} />
        )}

        <Button variant="secondary" leftIcon={<IconSettings width={14} height={14} />}>
          Preferences
        </Button>
      </div>
    </header>
  )
}

export { MiningHeader }
export type { MiningHeaderProps }
