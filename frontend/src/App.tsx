import { FormEvent, useEffect, useState } from 'react'
import { calculateQuote, createOrder, suggestCities, validateCity } from './api'
import type { CitySuggestion, QuoteResponse } from './types'

const initialCityErrors = {
  pickupCity: '',
  deliveryCity: '',
}

const initialContactErrors = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
}

function validateFullName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ')

  if (!normalized) {
    return 'Укажите имя и фамилию'
  }

  const parts = normalized.split(' ')
  if (parts.length < 2) {
    return 'Введите имя и фамилию'
  }

  const isValid = parts.every((part) => /^[A-Za-zА-Яа-яЁё-]{2,}$/.test(part))
  return isValid ? '' : 'Имя и фамилия должны содержать только буквы'
}

function validatePhone(value: string): string {
  const normalized = value.replace(/[^\d+]/g, '')
  const digits = normalized.replace(/\D/g, '')

  if (!value.trim()) {
    return 'Укажите номер телефона'
  }

  if (!/^(?:\+7|7|8)\d{10}$/.test(digits.length === 11 ? digits : normalized)) {
    return 'Введите корректный номер телефона'
  }

  return ''
}

function validateEmail(value: string): string {
  const normalized = value.trim()

  if (!normalized) {
    return ''
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ? ''
    : 'Введите корректный email'
}

export default function App() {
  const [pickupCity, setPickupCity] = useState('')
  const [deliveryCity, setDeliveryCity] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [cityErrors, setCityErrors] = useState(initialCityErrors)
  const [contactErrors, setContactErrors] = useState(initialContactErrors)
  const [pickupSuggestions, setPickupSuggestions] = useState<CitySuggestion[]>([])
  const [deliverySuggestions, setDeliverySuggestions] = useState<CitySuggestion[]>([])
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      if (pickupCity.trim().length < 2) {
        setPickupSuggestions([])
        return
      }

      try {
        setPickupSuggestions(await suggestCities(pickupCity))
      } catch {
        setPickupSuggestions([])
      }
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [pickupCity])

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      if (deliveryCity.trim().length < 2) {
        setDeliverySuggestions([])
        return
      }

      try {
        setDeliverySuggestions(await suggestCities(deliveryCity))
      } catch {
        setDeliverySuggestions([])
      }
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [deliveryCity])

  async function validateSingleCity(field: 'pickupCity' | 'deliveryCity', value: string) {
    if (!value.trim()) {
      setCityErrors((current) => ({ ...current, [field]: 'Укажите город' }))
      return false
    }

    try {
      const valid = await validateCity(value)
      setCityErrors((current) => ({
        ...current,
        [field]: valid ? '' : 'Такой город не найден',
      }))
      return valid
    } catch (error) {
      setCityErrors((current) => ({
        ...current,
        [field]: error instanceof Error ? error.message : 'Не удалось проверить город',
      }))
      return false
    }
  }

  function validateContacts() {
    const nextErrors = {
      customerName: validateFullName(customerName),
      customerPhone: validatePhone(customerPhone),
      customerEmail: validateEmail(customerEmail),
    }

    setContactErrors(nextErrors)
    return !nextErrors.customerName && !nextErrors.customerPhone && !nextErrors.customerEmail
  }

  async function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')
    setQuote(null)

    const [isPickupValid, isDeliveryValid] = await Promise.all([
      validateSingleCity('pickupCity', pickupCity),
      validateSingleCity('deliveryCity', deliveryCity),
    ])

    if (!isPickupValid || !isDeliveryValid) {
      return
    }

    setIsCalculating(true)

    try {
      const nextQuote = await calculateQuote(pickupCity, deliveryCity)
      setQuote(nextQuote)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось рассчитать стоимость')
    } finally {
      setIsCalculating(false)
    }
  }

  async function handleCreateOrder() {
    if (!quote) {
      setFormError('Сначала рассчитайте стоимость')
      return
    }

    if (!validateContacts()) {
      setFormError('Проверьте контактные данные')
      return
    }

    setFormError('')
    setIsSubmitting(true)

    try {
      await createOrder({
        pickupCity: quote.pickupCity,
        deliveryCity: quote.deliveryCity,
        customerName: customerName.trim().replace(/\s+/g, ' '),
        customerPhone,
        customerEmail: customerEmail.trim() || undefined,
      })
      setSuccessMessage('Заказ создан и сохранен в базе данных')
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
      setPickupCity('')
      setDeliveryCity('')
      setPickupSuggestions([])
      setDeliverySuggestions([])
      setQuote(null)
      setCityErrors(initialCityErrors)
      setContactErrors(initialContactErrors)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось создать заказ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">Сервис грузоперевозок</p>
          <h1>Заказ грузоперевозки между городами за пару минут</h1>
          <p className="hero__text">
            Введите два реальных города, получите расстояние и финальную цену, а затем
            сохраните заказ вместе с контактными данными.
          </p>
        </div>
        <div className="hero__card">
          <div className="hero__stat">
            <span>Автоматический расчет</span>
            <strong>API расстояний</strong>
          </div>
          <div className="hero__stat">
            <span>Цена по формуле</span>
            <strong>18 руб. / км</strong>
          </div>
          <div className="hero__stat">
            <span>Хранение заказов</span>
            <strong>PostgreSQL</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <form className="form" onSubmit={handleCalculate}>
          <div className="field-grid">
            <label className="field">
              <span>Город отправления</span>
              <input
                list="pickup-city-suggestions"
                value={pickupCity}
                onChange={(event) => {
                  setPickupCity(event.target.value)
                  setQuote(null)
                }}
                onBlur={() => void validateSingleCity('pickupCity', pickupCity)}
                placeholder="Например, Москва"
              />
              <datalist id="pickup-city-suggestions">
                {pickupSuggestions.map((suggestion) => (
                  <option key={suggestion.name} value={suggestion.name} />
                ))}
              </datalist>
              {cityErrors.pickupCity && <small>{cityErrors.pickupCity}</small>}
            </label>

            <label className="field">
              <span>Город назначения</span>
              <input
                list="delivery-city-suggestions"
                value={deliveryCity}
                onChange={(event) => {
                  setDeliveryCity(event.target.value)
                  setQuote(null)
                }}
                onBlur={() => void validateSingleCity('deliveryCity', deliveryCity)}
                placeholder="Например, Казань"
              />
              <datalist id="delivery-city-suggestions">
                {deliverySuggestions.map((suggestion) => (
                  <option key={suggestion.name} value={suggestion.name} />
                ))}
              </datalist>
              {cityErrors.deliveryCity && <small>{cityErrors.deliveryCity}</small>}
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={isCalculating}>
            {isCalculating ? 'Рассчитываем стоимость...' : 'Рассчитать стоимость'}
          </button>
        </form>

        {formError && <div className="message message--error">{formError}</div>}
        {successMessage && <div className="message message--success">{successMessage}</div>}

        {quote && (
          <section className="quote">
            <div className="quote__summary">
              <div>
                <p>Маршрут</p>
                <strong>
                  {quote.pickupCity} {'->'} {quote.deliveryCity}
                </strong>
              </div>
              <div>
                <p>Расстояние</p>
                <strong>{quote.distanceKm} км</strong>
              </div>
              <div>
                <p>Стоимость</p>
                <strong>{quote.price} руб.</strong>
              </div>
            </div>

            <div className="contacts">
              <h2>Если цена подходит, оставьте контакты</h2>
              <div className="field-grid">
                <label className="field">
                  <span>Имя и фамилия</span>
                  <input
                    value={customerName}
                    onChange={(event) => {
                      setCustomerName(event.target.value)
                      setContactErrors((current) => ({ ...current, customerName: '' }))
                    }}
                    onBlur={() =>
                      setContactErrors((current) => ({
                        ...current,
                        customerName: validateFullName(customerName),
                      }))
                    }
                    placeholder="Иван Иванов"
                  />
                  {contactErrors.customerName && <small>{contactErrors.customerName}</small>}
                </label>

                <label className="field">
                  <span>Телефон</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => {
                      setCustomerPhone(event.target.value)
                      setContactErrors((current) => ({ ...current, customerPhone: '' }))
                    }}
                    onBlur={() =>
                      setContactErrors((current) => ({
                        ...current,
                        customerPhone: validatePhone(customerPhone),
                      }))
                    }
                    placeholder="+7 999 123-45-67"
                  />
                  {contactErrors.customerPhone && <small>{contactErrors.customerPhone}</small>}
                </label>
              </div>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => {
                    setCustomerEmail(event.target.value)
                    setContactErrors((current) => ({ ...current, customerEmail: '' }))
                  }}
                  onBlur={() =>
                    setContactErrors((current) => ({
                      ...current,
                      customerEmail: validateEmail(customerEmail),
                    }))
                  }
                  placeholder="mail@example.com"
                />
                {contactErrors.customerEmail && <small>{contactErrors.customerEmail}</small>}
              </label>

              <button className="primary-button" type="button" onClick={handleCreateOrder} disabled={isSubmitting}>
                {isSubmitting ? 'Создаем заказ...' : 'Создать заказ'}
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
