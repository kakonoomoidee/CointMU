import { type JSX } from 'react'
import { useMiningStore, type MiningLog } from '@/store'

const LEVEL_TEXT_COLOR: Record<MiningLog['level'], string> = {
  OK: 'text-emerald-400',
  INFO: 'text-blue-400',
  WARN: 'text-amber-400',
  ERROR: 'text-red-400'
}

/**
 * Terminal-style mining log viewer. Renders the parsed Geth log stream from the
 * global mining store as a dark, monospaced three-column layout of aligned
 * timestamp, level badge, and message, with per-level coloring.
 * @returns The rendered mining log terminal.
 */
function MiningActivityLogs(): JSX.Element {
  const logs = useMiningStore((s) => s.miningLogs)

  return (
    <div className="h-[280px] bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-[11px] shadow-inner">
      <div className="space-y-1.5">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 hover:bg-slate-800/50 px-2 py-0.5 rounded transition-colors"
            >
              <span className="text-slate-500 w-16 flex-shrink-0">{log.timestamp}</span>
              <span className={`${LEVEL_TEXT_COLOR[log.level]} w-10 flex-shrink-0 font-bold`}>
                {log.level}
              </span>
              <span className="text-slate-300 flex-1 whitespace-pre-wrap break-all">
                {log.message}
              </span>
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-center py-8">Awaiting node activity...</div>
        )}
      </div>
    </div>
  )
}

export { MiningActivityLogs }
