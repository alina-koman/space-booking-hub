import type { KeyboardEvent } from 'react'
import {
  END_HOUR,
  getBookingColorClass,
  minutesOfDay,
  START_HOUR,
  timeSlots,
  toTime,
  TOTAL_MINUTES,
} from '../features/bookings/bookingUtils'
import type { Booking, Resource } from '../types'

interface ResourceCalendarProps {
  resources: Resource[]
  bookings: Booking[]
  onSelectSlot: (resourceId: string, startTime: string) => void
  onSelectBooking: (bookingId: string) => void
  onCancelBooking: (bookingId: string) => void
}

export default function ResourceCalendar({
  resources,
  bookings,
  onSelectSlot,
  onSelectBooking,
  onCancelBooking,
}: ResourceCalendarProps) {
  const rooms = resources.filter((resource) => resource.type === 'room')
  const devices = resources.filter((resource) => resource.type === 'device')

  const renderResourceRow = (resource: Resource) => {
    const resourceBookings = bookings.filter(({ resourceIds }) =>
      resourceIds.includes(resource.id),
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
              {resource.type === 'room' ? `${resource.capacity} місць` : 'Обладнання'}
            </span>
          </span>
          {resource.status === 'maintenance' && (
            <span className="maintenance-badge">Сервіс</span>
          )}
        </div>
        <div className="time-track timeline">
          {timeSlots.map((minutes) => {
            const time = toTime(START_HOUR * 60 + minutes)

            return (
              <button
                aria-label={`Забронювати ${resource.name} о ${time}`}
                className="time-slot"
                disabled={resource.status !== 'available'}
                key={minutes}
                onClick={() => onSelectSlot(resource.id, time)}
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
                className={`booking-block ${getBookingColorClass(booking.id)}`}
                key={booking.id}
                onClick={() => onSelectBooking(booking.id)}
                onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault()
                    onSelectBooking(booking.id)
                  }
                }}
                role="button"
                style={{ left: `${left}%`, width: `${width}%` }}
                tabIndex={0}
                title={`${booking.title} · ${toTime(start)}–${toTime(end)}`}
              >
                <span className="booking-time">
                  {toTime(start)}–{toTime(end)}
                </span>
                <strong>{booking.title}</strong>
                <button
                  aria-label={`Скасувати бронювання: ${booking.title}`}
                  className="booking-cancel"
                  onClick={(event) => {
                    event.stopPropagation()
                    onCancelBooking(booking.id)
                  }}
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
        <span className="legend-note">
          Робочий час: {toTime(START_HOUR * 60)}–{toTime(END_HOUR * 60)} · крок 30 хв
        </span>
      </div>
    </section>
  )
}
