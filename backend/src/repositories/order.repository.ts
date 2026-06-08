import { Pool } from 'pg'
import type { CreateOrderDto, OrderRecord } from '../types.js'

export class OrderRepository {
  constructor(private readonly db: Pool) {}

  async create(order: CreateOrderDto): Promise<OrderRecord> {
    const query = `
      INSERT INTO orders (
        pickup_city,
        delivery_city,
        distance_km,
        price,
        customer_name,
        customer_phone,
        customer_email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        pickup_city,
        delivery_city,
        distance_km,
        price,
        customer_name,
        customer_phone,
        customer_email
    `

    const values = [
      order.pickupCity,
      order.deliveryCity,
      order.distanceKm,
      order.price,
      order.customerName,
      order.customerPhone,
      order.customerEmail ?? null,
    ]

    const result = await this.db.query(query, values)
    const row = result.rows[0]

    return {
      id: row.id,
      pickupCity: row.pickup_city,
      deliveryCity: row.delivery_city,
      distanceKm: Number(row.distance_km),
      price: Number(row.price),
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email ?? undefined,
    }
  }
}
