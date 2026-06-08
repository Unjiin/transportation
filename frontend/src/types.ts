export interface QuoteResponse {
  distanceKm: number
  price: number
  pickupCity: string
  deliveryCity: string
}

export interface CitySuggestion {
  name: string
}

export interface OrderPayload {
  pickupCity: string
  deliveryCity: string
  customerName: string
  customerPhone: string
  customerEmail?: string
}

export interface OrderResponse {
  id: number
  message: string
}
