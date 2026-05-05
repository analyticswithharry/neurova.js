/**
 * Minimal CSV parser — handles quoted fields, embedded commas, escaped quotes,
 * and CRLF/LF line endings. No dependencies. Sufficient for typical dataset
 * files; not a full RFC 4180 implementation.
 */

export interface ParseCsvOptions {
  /** Treat first row as header. Default true. */
  header?: boolean
  /** Field delimiter. Default ','. */
  delimiter?: string
}

export interface ParseCsvResult {
  header: string[]
  rows: string[][]
}

export function parseCsv(text: string, opts: ParseCsvOptions = {}): ParseCsvResult {
  const delim = opts.delimiter ?? ','
  const useHeader = opts.header !== false
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let i = 0
  let inQuotes = false
  while (i < text.length) {
    const ch = text[i]!
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === delim) {
      cur.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\r') {
      i++
      continue
    }
    if (ch === '\n') {
      cur.push(field)
      field = ''
      if (cur.length > 1 || cur[0] !== '') rows.push(cur)
      cur = []
      i++
      continue
    }
    field += ch
    i++
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field)
    if (cur.length > 1 || cur[0] !== '') rows.push(cur)
  }
  if (useHeader && rows.length > 0) {
    const header = rows.shift()!
    return { header, rows }
  }
  return { header: [], rows }
}
