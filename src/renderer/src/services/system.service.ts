/**
 * Reads the live machine CPU load from the main process via the IPC bridge.
 * Returns the busy fraction in the range [0, 1] (for example 0.31 for 31
 * percent), or 0 when the bridge is unavailable.
 * @returns The current CPU usage fraction.
 */
async function getCpuUsage(): Promise<number> {
  try {
    return await window.api.getCpuUsage()
  } catch {
    return 0
  }
}

export { getCpuUsage }
