import { describe, it, expect, vi } from 'vitest'
import { throttle } from '@/utils/throttle'

describe('throttle', () => {
  it('throttles calls within window', async () => {
    const fn = vi.fn()
    const thr = throttle(fn, 50)
    thr(); thr(); thr()
    expect(fn).toHaveBeenCalledTimes(1)
    await new Promise(r=>setTimeout(r, 60))
    thr()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

