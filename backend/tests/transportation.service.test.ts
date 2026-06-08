import { describe, expect, it, vi } from 'vitest'
import { TransportationService } from '../src/services/transportation.service.js'

describe('TransportationService', () => {
  it('builds quote using distance and price services', async () => {
    const service = new TransportationService(
      {
        suggestCities: vi.fn(),
        validateCity: vi.fn(),
        findCity: vi
          .fn()
          .mockResolvedValueOnce({ lat: 55.75, lon: 37.61, displayName: 'Moscow' })
          .mockResolvedValueOnce({ lat: 55.79, lon: 49.12, displayName: 'Kazan' }),
      },
      {
        calculateDistanceKm: vi.fn().mockResolvedValue(815.4),
      },
      {
        calculate: vi.fn().mockReturnValue(14677),
      },
      {
        create: vi.fn(),
      },
    )

    await expect(service.calculateQuote('Москва', 'Казань')).resolves.toEqual({
      pickupCity: 'Москва',
      deliveryCity: 'Казань',
      distanceKm: 815.4,
      price: 14677,
    })
  })

  it('throws error when city does not exist', async () => {
    const service = new TransportationService(
      {
        suggestCities: vi.fn(),
        validateCity: vi.fn(),
        findCity: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ lat: 1, lon: 2, displayName: 'City' }),
      },
      {
        calculateDistanceKm: vi.fn(),
      },
      {
        calculate: vi.fn(),
      },
      {
        create: vi.fn(),
      },
    )

    await expect(service.calculateQuote('Unknown City', 'Kazan')).rejects.toThrow(
      'Один из указанных городов не найден',
    )
  })

  it('saves sanitized order data', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    const findCity = vi
      .fn()
      .mockResolvedValueOnce({ lat: 55.75, lon: 37.61, displayName: 'Moscow' })
      .mockResolvedValueOnce({ lat: 55.79, lon: 49.12, displayName: 'Kazan' })
    const service = new TransportationService(
      {
        suggestCities: vi.fn(),
        validateCity: vi.fn(),
        findCity,
      },
      {
        calculateDistanceKm: vi.fn().mockResolvedValue(815.4),
      },
      {
        calculate: vi.fn().mockReturnValue(14677),
      },
      {
        create,
      },
    )

    await service.createOrder({
      pickupCity: ' Москва ',
      deliveryCity: ' Казань ',
      customerName: ' Иван Иванов ',
      customerPhone: ' +7 999 000-11-22 ',
      customerEmail: ' mail@example.com ',
    })

    expect(create).toHaveBeenCalledWith({
      pickupCity: 'Москва',
      deliveryCity: 'Казань',
      distanceKm: 815.4,
      price: 14677,
      customerName: 'Иван Иванов',
      customerPhone: '+7 999 000-11-22',
      customerEmail: 'mail@example.com',
    })
  })

  it('rejects invalid full name', async () => {
    const service = new TransportationService(
      {
        suggestCities: vi.fn(),
        validateCity: vi.fn(),
        findCity: vi.fn(),
      },
      {
        calculateDistanceKm: vi.fn(),
      },
      {
        calculate: vi.fn(),
      },
      {
        create: vi.fn(),
      },
    )

    await expect(
      service.createOrder({
        pickupCity: 'Москва',
        deliveryCity: 'Казань',
        customerName: 'Иван',
        customerPhone: '+79990001122',
        customerEmail: 'mail@example.com',
      }),
    ).rejects.toThrow('Введите имя и фамилию')
  })

  it('rejects invalid phone', async () => {
    const service = new TransportationService(
      {
        suggestCities: vi.fn(),
        validateCity: vi.fn(),
        findCity: vi.fn(),
      },
      {
        calculateDistanceKm: vi.fn(),
      },
      {
        calculate: vi.fn(),
      },
      {
        create: vi.fn(),
      },
    )

    await expect(
      service.createOrder({
        pickupCity: 'Москва',
        deliveryCity: 'Казань',
        customerName: 'Иван Иванов',
        customerPhone: '12345',
        customerEmail: 'mail@example.com',
      }),
    ).rejects.toThrow('Введите корректный номер телефона')
  })

  it('rejects invalid email', async () => {
    const service = new TransportationService(
      {
        suggestCities: vi.fn(),
        validateCity: vi.fn(),
        findCity: vi.fn(),
      },
      {
        calculateDistanceKm: vi.fn(),
      },
      {
        calculate: vi.fn(),
      },
      {
        create: vi.fn(),
      },
    )

    await expect(
      service.createOrder({
        pickupCity: 'Москва',
        deliveryCity: 'Казань',
        customerName: 'Иван Иванов',
        customerPhone: '+79990001122',
        customerEmail: 'mail@',
      }),
    ).rejects.toThrow('Введите корректный email')
  })
})
