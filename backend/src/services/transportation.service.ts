import { OrderRepository } from '../repositories/order.repository.js'
import type { CreateOrderDto, CreateOrderRequest, QuoteResult } from '../types.js'
import { DistanceService } from './distance.service.js'
import { GeocodingService } from './geocoding.service.js'
import { PricingService } from './pricing.service.js'

function validateFullName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ')

  if (!normalized) {
    return 'Имя и фамилия обязательны'
  }

  const parts = normalized.split(' ')
  if (parts.length < 2) {
    return 'Введите имя и фамилию'
  }

  const isValid = parts.every((part) => /^[A-Za-zА-Яа-яЁё-]{2,}$/.test(part))
  return isValid ? '' : 'Имя и фамилия должны содержать только буквы'
}

function validatePhone(value: string): string {
  const normalized = value.trim().replace(/[^\d+]/g, '')
  const digits = normalized.replace(/\D/g, '')

  if (!normalized) {
    return 'Телефон обязателен'
  }

  if (!/^(?:7|8)\d{10}$/.test(digits)) {
    return 'Введите корректный номер телефона'
  }

  return ''
}

function validateEmail(value?: string): string {
  const normalized = value?.trim() ?? ''

  if (!normalized) {
    return ''
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ? ''
    : 'Введите корректный email'
}

export class TransportationService {
  constructor(
    private readonly geocodingService: Pick<GeocodingService, 'suggestCities' | 'validateCity' | 'findCity'>,
    private readonly distanceService: Pick<DistanceService, 'calculateDistanceKm'>,
    private readonly pricingService: Pick<PricingService, 'calculate'>,
    private readonly orderRepository: Pick<OrderRepository, 'create'>,
  ) {}

  async suggestCities(query: string) {
    return this.geocodingService.suggestCities(query.trim())
  }

  async validateCity(name: string): Promise<boolean> {
    return this.geocodingService.validateCity(name.trim())
  }

  async calculateQuote(pickupCity: string, deliveryCity: string): Promise<QuoteResult> {
    const [pickup, delivery] = await Promise.all([
      this.geocodingService.findCity(pickupCity.trim()),
      this.geocodingService.findCity(deliveryCity.trim()),
    ])

    if (!pickup || !delivery) {
      throw new Error('Один из указанных городов не найден')
    }

    const distanceKm = await this.distanceService.calculateDistanceKm(pickup, delivery)
    const price = this.pricingService.calculate(distanceKm)

    return {
      pickupCity: pickupCity.trim(),
      deliveryCity: deliveryCity.trim(),
      distanceKm,
      price,
    }
  }

  async createOrder(orderRequest: CreateOrderRequest) {
    const nameError = validateFullName(orderRequest.customerName)
    if (nameError) {
      throw new Error(nameError)
    }

    const phoneError = validatePhone(orderRequest.customerPhone)
    if (phoneError) {
      throw new Error(phoneError)
    }

    const emailError = validateEmail(orderRequest.customerEmail)
    if (emailError) {
      throw new Error(emailError)
    }

    const quote = await this.calculateQuote(orderRequest.pickupCity, orderRequest.deliveryCity)

    return this.orderRepository.create({
      ...quote,
      customerName: orderRequest.customerName.trim().replace(/\s+/g, ' '),
      customerPhone: orderRequest.customerPhone.trim(),
      customerEmail: orderRequest.customerEmail?.trim() || undefined,
    })
  }
}
