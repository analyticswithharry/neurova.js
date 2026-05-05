import { describe, expect, it } from 'vitest'
import {
  KMeans,
  KNearestNeighbors,
  LinearRegression,
  LogisticLearner,
  accuracyScore,
  duplicate,
  meanSquaredError,
  trainTestSplit,
} from '../src'

describe('BaseLearner contract', () => {
  it('all classifiers expose .train()/.infer()', () => {
    const knn = new KNearestNeighbors({ k: 3 })
    expect(typeof knn.train).toBe('function')
    expect(typeof knn.infer).toBe('function')
    expect(knn.trained).toBe(false)
  })

  it('duplicate clones an unfitted learner', () => {
    const a = new LogisticLearner({ strength: 0.5, lr: 0.2, epochs: 50 })
    a.train([[0], [1]], [0, 1])
    expect(a.trained).toBe(true)
    const b = duplicate(a)
    expect(b.strength).toBe(0.5)
    expect(b.lr).toBe(0.2)
    expect(b.trained).toBe(false)
  })
})

describe('KNearestNeighbors', () => {
  it('classifies a 2-D toy dataset', () => {
    const X = [
      [0, 0],
      [0, 1],
      [1, 0],
      [10, 10],
      [10, 11],
      [11, 10],
    ]
    const y = [0, 0, 0, 1, 1, 1]
    const knn = new KNearestNeighbors({ k: 3 }).train(X, y)
    expect(
      knn.infer([
        [0.5, 0.5],
        [10.5, 10.5],
      ]),
    ).toEqual([0, 1])
  })
})

describe('LogisticLearner', () => {
  it('learns a linearly separable boundary', () => {
    const X: number[][] = []
    const y: number[] = []
    for (let i = 0; i < 20; i++) {
      X.push([i / 20])
      y.push(i < 10 ? 0 : 1)
    }
    const m = new LogisticLearner({ epochs: 500, lr: 1 }).train(X, y)
    expect(m.infer([[0.1], [0.9]])).toEqual([0, 1])
  })
})

describe('LinearRegression', () => {
  it('recovers y = 2x + 1 exactly', () => {
    const X = [[0], [1], [2], [3], [4]]
    const y = [1, 3, 5, 7, 9]
    const m = new LinearRegression().train(X, y)
    expect(m.weights[0]).toBeCloseTo(2, 6)
    expect(m.bias).toBeCloseTo(1, 6)
    expect(m.infer([[10]])[0]).toBeCloseTo(21, 6)
  })
})

describe('KMeans', () => {
  it('separates two clusters', () => {
    const X = [
      [0, 0],
      [0, 1],
      [1, 0],
      [10, 10],
      [10, 11],
      [11, 10],
    ]
    const km = new KMeans({ k: 2, seed: 42 }).train(X)
    const labels = km.infer(X)
    // Either labeling is valid; both clusters must be internally consistent.
    expect(labels[0]).toBe(labels[1])
    expect(labels[3]).toBe(labels[4])
    expect(labels[0]).not.toBe(labels[3])
  })
})

describe('evaluation utils', () => {
  it('train/test split roundtrips length', () => {
    const X = Array.from({ length: 10 }, (_, i) => [i])
    const y = Array.from({ length: 10 }, (_, i) => i)
    const s = trainTestSplit(X, y, { testRatio: 0.3, seed: 1 })
    expect(s.Xtrain.length + s.Xtest.length).toBe(10)
    expect(s.ytrain.length + s.ytest.length).toBe(10)
  })

  it('accuracyScore counts hits', () => {
    expect(accuracyScore([1, 1, 0, 0], [1, 0, 0, 0])).toBe(0.75)
  })

  it('meanSquaredError computes correctly', () => {
    expect(meanSquaredError([1, 2, 3], [1, 2, 5])).toBeCloseTo(4 / 3, 6)
  })
})
