import { Router } from 'express'
import { TransportationController } from '../controllers/transportation.controller.js'

export function createTransportationRouter(controller: TransportationController) {
  const router = Router()

  router.get('/cities/suggest', controller.suggestCities)
  router.get('/cities/validate', controller.validateCity)
  router.post('/quote', controller.calculateQuote)
  router.post('/orders', controller.createOrder)

  return router
}
