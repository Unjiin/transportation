import dotenv from 'dotenv'

dotenv.config()

function getNumberEnv(name: string, fallback: number): number {
  const value = process.env[name]
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const config = {
  port: getNumberEnv('PORT', 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/transportation',
  pricePerKm: getNumberEnv('PRICE_PER_KM', 18),
  minPrice: getNumberEnv('MIN_PRICE', 1500),
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
}
