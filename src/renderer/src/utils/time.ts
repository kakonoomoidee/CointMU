import { intervalToDuration, formatDistanceToNowStrict, isAfter, subDays } from 'date-fns'

const IDLE_DURATION_PLACEHOLDER = '--'
const MILLISECONDS_PER_SECOND = 1000

/**
 * Left-pads a numeric value to two digits for fixed-width clock display.
 * @param value - The number to pad.
 * @returns A two-character zero-padded string.
 */
function padTwo(value: number): string {
  return value.toString().padStart(2, '0')
}

/**
 * Formats an elapsed duration in milliseconds into a compact clock string using
 * date-fns intervalToDuration. Hours are only shown once the elapsed time
 * reaches one hour, otherwise a minutes and seconds layout is used.
 * @param elapsedMs - The elapsed duration in milliseconds.
 * @returns A formatted duration string such as '1h 02m 03s' or '02m 03s'.
 */
function formatElapsed(elapsedMs: number): string {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return IDLE_DURATION_PLACEHOLDER
  }

  const duration = intervalToDuration({ start: 0, end: elapsedMs })
  const hours = duration.hours ?? 0
  const minutes = duration.minutes ?? 0
  const seconds = duration.seconds ?? 0
  const totalHours = (duration.days ?? 0) * 24 + hours

  if (totalHours > 0) {
    return `${totalHours}h ${padTwo(minutes)}m ${padTwo(seconds)}s`
  }

  return `${padTwo(minutes)}m ${padTwo(seconds)}s`
}

/**
 * Formats a Unix timestamp expressed in seconds into a human-readable relative
 * age string using date-fns formatDistanceToNowStrict.
 * @param timestampSeconds - The Unix timestamp in seconds.
 * @returns A relative age string such as '5 seconds ago'.
 */
function formatAge(timestampSeconds: number): string {
  if (!Number.isFinite(timestampSeconds) || timestampSeconds <= 0) {
    return IDLE_DURATION_PLACEHOLDER
  }

  return formatDistanceToNowStrict(new Date(timestampSeconds * MILLISECONDS_PER_SECOND), {
    addSuffix: true
  })
}

/**
 * Determines whether a Unix timestamp expressed in seconds falls within the
 * last 24 hours relative to now.
 * @param timestampSeconds - The Unix timestamp in seconds.
 * @returns True when the timestamp is newer than 24 hours ago.
 */
function isWithinLastDay(timestampSeconds: number): boolean {
  if (!Number.isFinite(timestampSeconds) || timestampSeconds <= 0) {
    return false
  }

  const date = new Date(timestampSeconds * MILLISECONDS_PER_SECOND)
  return isAfter(date, subDays(new Date(), 1))
}

export { formatElapsed, formatAge, isWithinLastDay }
