import { ipcMain } from 'electron'
import { cpus } from 'node:os'

const CPU_SAMPLE_DELAY_MS = 200

interface CpuTicks {
  idle: number
  total: number
}

/**
 * Captures a point-in-time aggregate of CPU scheduler ticks summed across every
 * logical core. The total spans all time categories while idle isolates the
 * idle category, enabling a load ratio to be derived from two spaced samples.
 * @returns The aggregated idle and total tick counts.
 */
function sampleCpuTicks(): CpuTicks {
  let idle = 0
  let total = 0
  for (const cpu of cpus()) {
    for (const value of Object.values(cpu.times)) {
      total += value
    }
    idle += cpu.times.idle
  }
  return { idle, total }
}

/**
 * Suspends for the given duration without blocking the event loop.
 * @param ms - The delay in milliseconds.
 * @returns A promise that resolves once the delay elapses.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Registers system telemetry IPC handlers on the main process. The get-cpu-usage
 * handler measures live machine CPU load by computing the delta between idle and
 * total scheduler ticks across two samples spaced by a short interval, returning
 * the busy fraction in the range [0, 1] (for example 0.31 for 31 percent).
 * @returns Nothing.
 */
export function registerSystemHandlers(): void {
  ipcMain.handle('get-cpu-usage', async (): Promise<number> => {
    const start = sampleCpuTicks()
    await delay(CPU_SAMPLE_DELAY_MS)
    const end = sampleCpuTicks()

    const idleDelta = end.idle - start.idle
    const totalDelta = end.total - start.total

    if (totalDelta <= 0) {
      return 0
    }

    const usage = 1 - idleDelta / totalDelta
    return Math.min(1, Math.max(0, usage))
  })
}
