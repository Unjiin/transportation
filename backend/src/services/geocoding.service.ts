import type { CitySuggestion, Coordinates } from '../types.js'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  addresstype?: string
  class?: string
  type?: string
  address?: {
    city?: string
    town?: string
    municipality?: string
    state?: string
  }
}

function extractCityName(item: NominatimResult): string | null {
  const allowedAddressTypes = new Set(['city', 'town'])

  if (item.class !== 'place' || !allowedAddressTypes.has(item.addresstype ?? '')) {
    return null
  }

  return item.address?.city ?? item.address?.town ?? null
}

export class GeocodingService {
  async suggestCities(query: string): Promise<CitySuggestion[]> {
    if (query.trim().length < 2) {
      return []
    }

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '10')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('accept-language', 'ru')

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'transportation-app/1.0',
      },
    })

    if (!response.ok) {
      throw new Error('Не удалось получить список городов')
    }

    const data = (await response.json()) as NominatimResult[]
    const seen = new Set<string>()

    return data
      .map(extractCityName)
      .filter((name): name is string => Boolean(name))
      .filter((name) => {
        const normalized = name.toLocaleLowerCase('ru-RU')
        if (seen.has(normalized)) {
          return false
        }

        seen.add(normalized)
        return true
      })
      .slice(0, 5)
      .map((name) => ({ name }))
  }

  async validateCity(city: string): Promise<boolean> {
    const result = await this.findCity(city)
    return result !== null
  }

  async findCity(city: string): Promise<Coordinates | null> {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', city)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')
    url.searchParams.set('featuretype', 'city')

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'transportation-app/1.0',
      },
    })

    if (!response.ok) {
      throw new Error('Не удалось проверить город через геокодер')
    }

    const data = (await response.json()) as NominatimResult[]
    const first = data[0]

    if (!first) {
      return null
    }

    return {
      lat: Number(first.lat),
      lon: Number(first.lon),
      displayName: first.display_name,
    }
  }
}
