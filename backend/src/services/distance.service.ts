import type { Coordinates } from '../types.js'

interface OsrmRouteResponse {
  routes?: Array<{
    distance: number
  }>
}

export class DistanceService {
  async calculateDistanceKm(from: Coordinates, to: Coordinates): Promise<number> {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'transportation-app/1.0',
      },
    })

    if (!response.ok) {
      throw new Error('Не удалось получить расстояние между городами')
    }

    const data = (await response.json()) as OsrmRouteResponse
    const route = data.routes?.[0]

    if (!route) {
      throw new Error('Маршрут между указанными городами не найден')
    }

    return Math.round((route.distance / 1000) * 10) / 10
  }
}
