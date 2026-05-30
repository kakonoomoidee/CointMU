type ClassValue = string | number | false | null | undefined

/**
 * Joins truthy class name fragments into a single space-delimited string.
 * @param values - Class name fragments; falsey values are ignored.
 * @returns The combined class name string.
 */
function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}

export { cn }
