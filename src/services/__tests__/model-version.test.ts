import { describe, it, expect } from 'vitest'
import { withVersion } from '@/services/model-version'

describe('withVersion', () => {
  it('adds schemaVersion', () => {
    const out = withVersion({ a: 1 })
    expect(out).toHaveProperty('schemaVersion')
  })
})

