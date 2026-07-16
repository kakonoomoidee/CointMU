import { subDays, format } from 'date-fns'

const YEARLY_WINDOW_DAYS = 365
const SECONDS_TO_MS = 1000

export interface ActivityContribution {
  date: string
  blocksValidated: number
  miningOperations: number
}

/**
 * Aggregates real self-mined blocks into a daily contribution series covering
 * strictly the last 365 days, ending today and ordered oldest to newest. Each
 * day's found-block count is mirrored into both blocksValidated and
 * miningOperations, since a sealed block represents one validation and one
 * completed mining operation. Blocks outside the 365-day window are excluded.
 * @param blocks - Found blocks carrying a Unix timestamp in seconds.
 * @returns The ordered list of daily contributions for the last 365 days.
 */
export function getYearlyActivity(blocks: { timestamp: number }[]): ActivityContribution[] {
  const countsByDate = new Map<string, number>()
  for (const block of blocks) {
    const key = format(new Date(block.timestamp * SECONDS_TO_MS), 'yyyy-MM-dd')
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1)
  }

  const today = new Date()
  const contributions: ActivityContribution[] = []
  for (let offset = YEARLY_WINDOW_DAYS - 1; offset >= 0; offset--) {
    const date = format(subDays(today, offset), 'yyyy-MM-dd')
    const count = countsByDate.get(date) ?? 0
    contributions.push({ date, blocksValidated: count, miningOperations: count })
  }

  return contributions
}
