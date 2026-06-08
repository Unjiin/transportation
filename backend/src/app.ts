import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { TransportationController } from './controllers/transportation.controller.js'
import { pool } from './db/pool.js'
import { OrderRepository } from './repositories/order.repository.js'
import { createTransportationRouter } from './routes/transportation.routes.js'
import { DistanceService } from './services/distance.service.js'
import { GeocodingService } from './services/geocoding.service.js'
import { PricingService } from './services/pricing.service.js'
import { TransportationService } from './services/transportation.service.js'

export function createApp() {
  const geocodingService = new GeocodingService()
  const distanceService = new DistanceService()
  const pricingService = new PricingService(config.pricePerKm, config.minPrice)
  const orderRepository = new OrderRepository(pool)
  const transportationService = new TransportationService(
    geocodingService,
    distanceService,
    pricingService,
    orderRepository,
  )
  const transportationController = new TransportationController(transportationService)

  const app = express()

  app.use(
    cors({
      origin: config.allowedOrigin,
    }),
  )
  app.use(express.json())

  app.get('/health', (_request, response) => {
    response.json({ ok: true })
  })

  app.use('/api', createTransportationRouter(transportationController))

  return app
}
