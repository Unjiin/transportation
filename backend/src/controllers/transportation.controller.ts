import { Request, Response } from 'express'
import { TransportationService } from '../services/transportation.service.js'

export class TransportationController {
  constructor(private readonly transportationService: TransportationService) {}

  suggestCities = async (request: Request, response: Response) => {
    try {
      const query = String(request.query.q ?? '')

      if (!query.trim()) {
        return response.json([])
      }

      const suggestions = await this.transportationService.suggestCities(query)
      return response.json(suggestions)
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  validateCity = async (request: Request, response: Response) => {
    try {
      const city = String(request.query.name ?? '')

      if (!city.trim()) {
        return response.status(400).json({ message: 'Параметр name обязателен' })
      }

      const valid = await this.transportationService.validateCity(city)
      return response.json({ valid })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  calculateQuote = async (request: Request, response: Response) => {
    try {
      const { pickupCity, deliveryCity } = request.body as Record<string, string>

      if (!pickupCity?.trim() || !deliveryCity?.trim()) {
        return response.status(400).json({ message: 'Нужно указать оба города' })
      }

      const quote = await this.transportationService.calculateQuote(pickupCity, deliveryCity)
      return response.json(quote)
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  createOrder = async (request: Request, response: Response) => {
    try {
      const {
        pickupCity,
        deliveryCity,
        customerName,
        customerPhone,
        customerEmail,
      } = request.body as Record<string, string | number | undefined>

      if (!pickupCity || !deliveryCity || !customerName || !customerPhone) {
        return response.status(400).json({ message: 'Недостаточно данных для создания заказа' })
      }

      const order = await this.transportationService.createOrder({
        pickupCity: String(pickupCity),
        deliveryCity: String(deliveryCity),
        customerName: String(customerName),
        customerPhone: String(customerPhone),
        customerEmail: customerEmail ? String(customerEmail) : undefined,
      })

      return response.status(201).json({
        id: order.id,
        message: 'Заказ успешно создан',
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  private handleError(response: Response, error: unknown) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return response.status(500).json({ message })
  }
}
