/** falsy 값을 걸러 className을 이어 붙인다. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
