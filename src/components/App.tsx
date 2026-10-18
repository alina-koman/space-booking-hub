import { useMemo, useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  addBooking,
  cancelBooking,
  setSelectedDate,
} from '../features/bookings/bookingSlice'
import {
  selectBookingsForDate,
  selectHasBookingConflict,
} from '../features/bookings/selectors'
import {
  setQuery,
  setResourceType,
  toggleEquipment,
} from '../features/filters/filterSlice'
import { selectFilteredResources } from '../features/resources/selectors'
import type { Resource } from '../types'
import '../App.css'

const START_HOUR = 8
const END_HOUR = 20
const SLOT_MINUTES = 30
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const timeSlots = Array.from(
  { length: TOTAL_MINUTES / SLOT_MINUTES },
  (_, index) => index * SLOT_MINUTES,
)

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const toLocalIso = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString()

const minutesOfDay = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.getHours() * 60 + date.getMinutes()
}

const changeDate = (date: string, amount: number) => {
  const nextDate = new Date(`${date}T12:00:00`)
  nextDate.setDate(nextDate.getDate() + amount)
  return [
    nextDate.getFullYear(),
    String(nextDate.getMonth() + 1).padStart(2, '0'),
    String(nextDate.getDate()).padStart(2, '0'),
  ].join('-')
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))

interface BookingFormProps {
  resources: Resource[]
  date: string
  initialResourceId?: string
  initialStartTime?: string
  onClose: () => void
}

function BookingForm({
  resources,
  date,
  initialResourceId,
  initialStartTime,
  onClose,
}: BookingFormProps) {
  const dispatch = useAppDispatch()
  const availableResources = resources.filter((resource) => resource.status === 'available')
  const resourcesByType = {
    room: resources.filter((resource) => resource.type === 'room'),
    device: resources.filter((resource) => resource.type === 'device'),
  }
  const [bookingDate, setBookingDate] = useState(date)
  const [resourceId, setResourceId] = useState(
    initialResourceId ?? availableResources[0]?.id ?? '',
  )
  const [startTime, setStartTime] = useState(initialStartTime ?? '09:00')
  const [endTime, setEndTime] = useState(() => {
    const start = initialStartTime
      ? Number(initialStartTime.slice(0, 2)) * 60 + Number(initialStartTime.slice(3))
      : 9 * 60
    return toTime(Math.min(start + 60, END_HOUR * 60))
  })
  const [title, setTitle] = useState('')

  const validInterval = startTime !== '' && endTime !== '' && endTime > startTime
  const conflict = useAppSelector((state) =>
    validInterval
      ? selectHasBookingConflict(
          state,
          resourceId,
          toLocalIso(bookingDate, startTime),
          toLocalIso(bookingDate, endTime),
        )
      : false,
  )
  const selectedResource = availableResources.find(({ id }) => id === resourceId)
  const canSubmit =
    Boolean(selectedResource && title.trim() && validInterval) && !conflict

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    dispatch(
      addBooking({
        id: crypto.randomUUID(),
        resourceId,
        title: title.trim(),
        startsAt: toLocalIso(bookingDate, startTime),
        endsAt: toLocalIso(bookingDate, endTime),
        status: 'confirmed',
      }),
    )
    dispatch(setSelectedDate(bookingDate))
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="booking-title"
        aria-modal="true"
        className="booking-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">НОВЕ БРОНЮВАННЯ</p>
            <h2 id="booking-title">Забронювати ресурс</h2>
          </div>
          <button aria-label="Закрити" className="icon-button" onClick={onClose} type="button">
            ×
          </button>
        </div>
        {availableResources.length === 0 ? (
          <p>Немає доступних ресурсів для бронювання.</p>
        ) : (
          <form className="booking-form" onSubmit={handleSubmit}>
            <label>
              Назва зустрічі
              <input
                autoFocus
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Наприклад, планування спринту"
                required
                value={title}
              />
            </label>
            <label>
              Ресурс
              <select
                onChange={(event) => setResourceId(event.target.value)}
                value={resourceId}
              >
                {(['room', 'device'] as const).map((type) => (
                  <optgroup
                    key={type}
                    label={type === 'room' ? 'Кімнати' : 'Обладнання'}
                  >
                    {resourcesByType[type].map((resource) => (
                      <option
                        disabled={resource.status !== 'available'}
                        key={resource.id}
                        value={resource.id}
                      >
                        {resource.name}
                        {resource.status !== 'available' ? ' · на обслуговуванні' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <p className="form-hint">
              У списку кімнати й обладнання згруповані окремо. Пристрої на
              обслуговуванні недоступні для бронювання. Одне бронювання — один
              ресурс; для кімнати й обладнання створи окремі бронювання.
            </p>
            <label>
              Дата бронювання
              <input
                onChange={(event) => setBookingDate(event.target.value)}
                required
                type="date"
                value={bookingDate}
              />
            </label>
            <div className="time-fields">
              <label>
                Початок
                <input
                  max="19:30"
                  min={`${String(START_HOUR).padStart(2, '0')}:00`}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                  step={SLOT_MINUTES * 60}
                  type="time"
                  value={startTime}
                />
              </label>
              <label>
                Завершення
                <input
                  max={`${String(END_HOUR).padStart(2, '0')}:00`}
                  min={`${String(START_HOUR).padStart(2, '0')}:30`}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                  step={SLOT_MINUTES * 60}
                  type="time"
                  value={endTime}
                />
              </label>
            </div>
            {!validInterval && startTime && endTime && (
              <p className="form-error" role="alert">
                Час завершення має бути пізніше за час початку.
              </p>
            )}
            {conflict && (
              <p className="form-error" role="alert">
                Цей ресурс уже заброньовано на вказаний час.
              </p>
            )}
            <div className="modal-actions">
              <button className="button button-secondary" onClick={onClose} type="button">
                Скасувати
              </button>
              <button className="button button-primary" disabled={!canSubmit} type="submit">
                Забронювати
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function App() {
  const dispatch = useAppDispatch()
  const date = useAppSelector((state) => state.bookings.selectedDate)
  const filters = useAppSelector((state) => state.filters)
  const resources = useAppSelector(selectFilteredResources)
  const bookings = useAppSelector((state) => selectBookingsForDate(state, date))
  const allResources = useAppSelector((state) => state.resources)
  const rooms = resources.filter((resource) => resource.type === 'room')
  const devices = resources.filter((resource) => resource.type === 'device')
  const [formRequest, setFormRequest] = useState<{
    resourceId?: string
    startTime?: string
  } | null>(null)

  const equipmentOptions = useMemo(
    () => [...new Set(allResources.flatMap((resource) => resource.equipment))].sort(),
    [allResources],
  )

  const renderResourceRow = (resource: Resource) => {
    const resourceBookings = bookings.filter(
      (booking) => booking.resourceId === resource.id,
    )

    return (
      <div className="resource-row" key={resource.id}>
        <div className="resource-info">
          <span className={`resource-icon ${resource.type}`}>
            {resource.type === 'room' ? '⌂' : '▣'}
          </span>
          <span className="resource-details">
            <strong>{resource.name}</strong>
            <span>
              {resource.type === 'room'
                ? `${resource.capacity} місць`
                : 'Обладнання'}
            </span>
          </span>
          {resource.status === 'maintenance' && (
            <span className="maintenance-badge">Сервіс</span>
          )}
        </div>
        <div className="time-track timeline">
          {timeSlots.map((minutes) => {
            const startsAtMinutes = START_HOUR * 60 + minutes
            const time = toTime(startsAtMinutes)

            return (
              <button
                aria-label={`Забронювати ${resource.name} о ${time}`}
                className="time-slot"
                disabled={resource.status !== 'available'}
                key={minutes}
                onClick={() =>
                  setFormRequest({
                    resourceId: resource.id,
                    startTime: time,
                  })
                }
                type="button"
              />
            )
          })}
          {resourceBookings.map((booking) => {
            const start = minutesOfDay(booking.startsAt)
            const end = minutesOfDay(booking.endsAt)
            const left = ((start - START_HOUR * 60) / TOTAL_MINUTES) * 100
            const width = ((end - start) / TOTAL_MINUTES) * 100

            return (
              <article
                className="booking-block"
                key={booking.id}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${booking.title} · ${toTime(start)}–${toTime(end)}`}
              >
                <span className="booking-time">
                  {toTime(start)}–{toTime(end)}
                </span>
                <strong>{booking.title}</strong>
                <button
                  aria-label={`Скасувати бронювання: ${booking.title}`}
                  className="booking-cancel"
                  onClick={() => dispatch(cancelBooking(booking.id))}
                  type="button"
                >
                  ×
                </button>
              </article>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a aria-label="Spacebook home" className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>spacebook</span>
        </a>
        <span className="topbar-note">Календар ресурсів</span>
        <button
          className="button button-primary topbar-button"
          onClick={() => setFormRequest({})}
          type="button"
        >
          <span aria-hidden="true">+</span> Нове бронювання
        </button>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">ПРОСТІР ДЛЯ СПІЛЬНОЇ РОБОТИ</p>
          <h1>Бронювання ресурсів</h1>
          <p className="page-description">
            Обери кімнату або обладнання та знайди вільний час.
          </p>
        </div>
        <div className="date-picker">
          <button
            aria-label="Попередній день"
            className="icon-button"
            onClick={() => dispatch(setSelectedDate(changeDate(date, -1)))}
            type="button"
          >
            ‹
          </button>
          <strong>{formatDate(date)}</strong>
          <button
            aria-label="Наступний день"
            className="icon-button"
            onClick={() => dispatch(setSelectedDate(changeDate(date, 1)))}
            type="button"
          >
            ›
          </button>
          <input
            aria-label="Обрати дату"
            className="date-input"
            onChange={(event) => {
              if (event.target.value) {
                dispatch(setSelectedDate(event.target.value))
              }
            }}
            type="date"
            value={date}
          />
        </div>
      </section>

      <section aria-label="Фільтри ресурсів" className="filter-panel">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            onChange={(event) => dispatch(setQuery(event.target.value))}
            placeholder="Пошук ресурсів..."
            value={filters.query}
          />
        </label>
        <label className="type-filter">
          <span>Тип ресурсу</span>
          <select
            onChange={(event) =>
              dispatch(
                setResourceType(event.target.value as 'all' | 'room' | 'device'),
              )
            }
            value={filters.type}
          >
            <option value="all">Усі ресурси</option>
            <option value="room">Кімнати</option>
            <option value="device">Обладнання</option>
          </select>
        </label>
        <div className="equipment-filters">
          <span>Обладнання</span>
          <div className="equipment-options">
            {equipmentOptions.map((item) => (
              <label className="checkbox-filter" key={item}>
                <input
                  checked={filters.equipment.includes(item)}
                  onChange={() => dispatch(toggleEquipment(item))}
                  type="checkbox"
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Розклад ресурсів" className="calendar-card">
        <div className="calendar-caption">
          <div>
            <h2>Розклад на день</h2>
            <p>Натисни на вільний слот, щоб створити бронювання</p>
          </div>
          <span className="resource-count">
            {resources.length} {resources.length === 1 ? 'ресурс' : 'ресурсів'}
          </span>
        </div>
        <div className="calendar-scroll">
          <div className="calendar">
            <div className="calendar-header">
              <div className="resource-column-heading">РЕСУРС</div>
              <div className="time-track time-track-header">
                {timeSlots.map((minutes) => (
                  <div className="time-label" key={minutes}>
                    {minutes % 60 === 0 ? toTime(START_HOUR * 60 + minutes) : ''}
                  </div>
                ))}
              </div>
            </div>
            {rooms.length > 0 && (
              <section aria-label="Кімнати" className="resource-group">
                <h3 className="resource-group-heading">Кімнати</h3>
                {rooms.map(renderResourceRow)}
              </section>
            )}
            {devices.length > 0 && (
              <section aria-label="Обладнання" className="resource-group">
                <h3 className="resource-group-heading">Обладнання</h3>
                {devices.map(renderResourceRow)}
              </section>
            )}
            {resources.length === 0 && (
              <p className="empty-state">За цими фільтрами ресурси не знайдено.</p>
            )}
            <div className="calendar-footer">
              <span>{toTime(START_HOUR * 60)}</span>
              <span>{toTime(END_HOUR * 60)}</span>
            </div>
          </div>
        </div>
        <div className="calendar-legend">
          <span><i /> Підтверджене бронювання</span>
          <span className="legend-note">Робочий час: 08:00–20:00 · крок 30 хв</span>
        </div>
      </section>

      {formRequest && (
        <BookingForm
          date={date}
          initialResourceId={formRequest.resourceId}
          initialStartTime={formRequest.startTime}
          onClose={() => setFormRequest(null)}
          resources={allResources}
        />
      )}
    </main>
  )
}

export default App
