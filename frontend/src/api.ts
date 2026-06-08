import type { CitySuggestion, OrderPayload, OrderResponse, QuoteResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка запроса' }))
    throw new Error(error.message ?? 'Ошибка запроса')
  }

  return response.json() as Promise<T>
}

export async function validateCity(name: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/cities/validate?name=${encodeURIComponent(name)}`)
  const data = await handleResponse<{ valid: boolean }>(response)

  return data.valid
}

export async function suggestCities(query: string): Promise<CitySuggestion[]> {
  const response = await fetch(`${API_URL}/cities/suggest?q=${encodeURIComponent(query)}`)
  return handleResponse<CitySuggestion[]>(response)
}

export async function calculateQuote(pickupCity: string, deliveryCity: string): Promise<QuoteResponse> {
  const response = await fetch(`${API_URL}/quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pickupCity, deliveryCity }),
  })

  return handleResponse<QuoteResponse>(response)
}

export async function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse<OrderResponse>(response)
}
