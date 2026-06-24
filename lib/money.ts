/** Format an integer EGP amount for display. e.g. 120 → "120 ج.م" */
export function formatEGP(amount: number): string {
  return `${amount.toLocaleString("en-US")} ج.م`;
}

/** Parse a user-entered string to an integer EGP amount. Throws on invalid input. */
export function parseEGP(value: string): number {
  const trimmed = value.trim().replace(/,/g, "");
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid EGP amount: ${value}`);
  }
  return n;
}
