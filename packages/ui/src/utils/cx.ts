export type ClassValue = string | number | null | false | undefined | ClassValue[]

/** Tiny clsx replacement — joins truthy class names. */
export function cx(...args: ClassValue[]): string {
  const out: string[] = []
  for (const a of args) {
    if (!a) continue
    if (Array.isArray(a)) {
      const sub = cx(...a)
      if (sub) out.push(sub)
    } else {
      out.push(String(a))
    }
  }
  return out.join(' ')
}
