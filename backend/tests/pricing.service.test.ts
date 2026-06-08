import { describe, expect, it } from 'vitest'
import { PricingService } from '../src/services/pricing.service.js'

describe('PricingService', () => {
  it('calculates price by distance when it is above minimum price', () => {
    const service = new PricingService(18, 1500)

    expect(service.calculate(200)).toBe(3600)
  })

  it('uses minimum price for short distance', () => {
    const service = new PricingService(18, 1500)

    expect(service.calculate(10)).toBe(1500)
  })
})
