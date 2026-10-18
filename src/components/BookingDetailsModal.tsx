import { formatBookingDate, formatBookingTime, getBookingColorClass } from '../features/bookings/bookingUtils'
import type { Booking, Resource } from '../types'

interface BookingDetailsModalProps {
  booking: Booking
  resources: Resource[]
  onClose: () => void
  onCancel: () => void
}

export default function BookingDetailsModal({
  booking,
  resources,
  onClose,
  onCancel,
}: BookingDetailsModalProps) {
  const bookingResources = booking.resourceIds
    .map((resourceId) => resources.find(({ id }) => id === resourceId))
    .filter((resource): resource is Resource => resource !== undefined)
  const room = bookingResources.find((resource) => resource.type === 'room')
  const equipment = bookingResources.filter((resource) => resource.type === 'device')
  const colorClass = getBookingColorClass(booking.id)

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="booking-details-title"
        aria-modal="true"
        className="booking-modal booking-details-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">ДЕТАЛІ БРОНЮВАННЯ</p>
            <h2 id="booking-details-title">{booking.title}</h2>
          </div>
          <button aria-label="Закрити" className="icon-button" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <dl className="booking-detail-list">
          <div>
            <dt>Дата</dt>
            <dd>{formatBookingDate(booking.startsAt)}</dd>
          </div>
          <div>
            <dt>Час</dt>
            <dd>
              {formatBookingTime(booking.startsAt)}–{formatBookingTime(booking.endsAt)}
            </dd>
          </div>
          <div>
            <dt>Кімната</dt>
            <dd>
              {room ? (
                <span className={`resource-chip ${colorClass}`}>{room.name}</span>
              ) : (
                'Не вказана'
              )}
            </dd>
          </div>
          <div>
            <dt>Обладнання</dt>
            <dd className="resource-chip-list">
              {equipment.length > 0 ? (
                equipment.map((device) => (
                  <span className={`resource-chip ${colorClass}`} key={device.id}>
                    {device.name}
                  </span>
                ))
              ) : (
                <span>Не обрано</span>
              )}
            </dd>
          </div>
        </dl>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onClose} type="button">
            Закрити
          </button>
          <button className="button button-danger" onClick={onCancel} type="button">
            Скасувати бронювання
          </button>
        </div>
      </section>
    </div>
  )
}
