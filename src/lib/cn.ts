/**
 * Lightweight className concatenator (clsx-style).
 * Filters falsy values so callers can write `cn("base", cond && "active")`.
 */
export function cn(
  ...classes: Array<string | number | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}
