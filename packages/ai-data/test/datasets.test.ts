import { describe, it, expect } from 'vitest'
import { loadIris, parseCsv, asMatrix, row } from '../src'

describe('loadIris', () => {
  const ds = loadIris()

  it('has 150 samples × 4 features × 3 classes', () => {
    expect(ds.nSamples).toBe(150)
    expect(ds.nFeatures).toBe(4)
    expect(ds.data.length).toBe(600)
    expect(ds.target.length).toBe(150)
    expect(ds.targetNames).toEqual(['setosa', 'versicolor', 'virginica'])
  })

  it('first row matches the canonical Iris dataset', () => {
    expect(Array.from(ds.data.slice(0, 4))).toEqual([
      Math.fround(5.1), Math.fround(3.5), Math.fround(1.4), Math.fround(0.2),
    ])
    expect(ds.target[0]).toBe(0)
  })

  it('class distribution is 50/50/50', () => {
    const counts = [0, 0, 0]
    for (let i = 0; i < ds.nSamples; i++) counts[ds.target[i]!]!++
    expect(counts).toEqual([50, 50, 50])
  })
})

describe('helpers', () => {
  const ds = loadIris()

  it('row returns a length-nFeatures array', () => {
    const r = row(ds, 0)
    expect(r.length).toBe(4)
  })

  it('asMatrix returns a 2-D array shaped [n × f]', () => {
    const m = asMatrix(ds)
    expect(m.length).toBe(150)
    expect(m[0]!.length).toBe(4)
  })
})

describe('parseCsv', () => {
  it('handles header + simple rows', () => {
    const out = parseCsv('a,b,c\n1,2,3\n4,5,6\n')
    expect(out.header).toEqual(['a', 'b', 'c'])
    expect(out.rows).toEqual([['1', '2', '3'], ['4', '5', '6']])
  })

  it('handles quoted fields with commas and escaped quotes', () => {
    const out = parseCsv('"a,b","c""d"\n', { header: false })
    expect(out.rows).toEqual([['a,b', 'c"d']])
  })
})
