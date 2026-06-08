export interface Coordinates {
  lat: number
  lon: number
  displayName: string
}

export interface CitySuggestion {
  name: string
}

export interface QuoteResult {
  pickupCity: string
  deliveryCity: string
  distanceKm: number
  price: number
}

export interface CreateOrderRequest {
  pickupCity: string
  deliveryCity: string
  customerName: string
  customerPhone: string
  customerEmail?: string
}

export interface CreateOrderDto extends QuoteResult {
  customerName: string
  customerPhone: string
  customerEmail?: string
}

export interface OrderRecord extends CreateOrderDto {
  id: number
}
