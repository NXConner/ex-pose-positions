import { describe, it, expect } from 'vitest'
import { getRandomNumber } from '@/utils'

describe('utils', () => {
  it('getRandomNumber returns within bounds', () => {
    const min = 0, max = 10
    const n = getRandomNumber(min, max)
    expect(n).toBeGreaterThanOrEqual(min)
    expect(n).toBeLessThanOrEqual(max)
  })
})

