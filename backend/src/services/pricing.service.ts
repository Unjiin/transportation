export class PricingService {
  constructor(
    private readonly pricePerKm: number,
    private readonly minPrice: number,
  ) {}

  calculate(distanceKm: number): number {
    const calculated = distanceKm * this.pricePerKm
    return Math.round(Math.max(calculated, this.minPrice))
  }
}
