import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { cancelBooking, setSelectedDate } from '../features/bookings/bookingSlice'
import { selectBookingsForDate } from '../features/bookings/selectors'
import { changeDate, formatDate } from '../features/bookings/bookingUtils'
import { selectFilteredResources } from '../features/resources/selectors'
import BookingDetailsModal from './BookingDetailsModal'
import BookingForm from './BookingForm'
import ResourceCalendar from './ResourceCalendar'
import ResourceFilters from './ResourceFilters'
import '../App.css'

export default function BookingPage() {
  const dispatch = useAppDispatch()
  const date = useAppSelector((state) => state.bookings.selectedDate)
  const resources = useAppSelector(selectFilteredResources)
  const bookings = useAppSelector((state) => selectBookingsForDate(state, date))
  const allResources = useAppSelector((state) => state.resources)
  const [formRequest, setFormRequest] = useState<{
    resourceId?: string
    startTime?: string
  } | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const selectedBooking = bookings.find(({ id }) => id === selectedBookingId)

  const equipmentOptions = useMemo(
    () => [...new Set(allResources.flatMap((resource) => resource.equipment))].sort(),
    [allResources],
  )

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

      <ResourceFilters equipmentOptions={equipmentOptions} />

      <ResourceCalendar
        bookings={bookings}
        onCancelBooking={(bookingId) => dispatch(cancelBooking(bookingId))}
        onSelectBooking={setSelectedBookingId}
        onSelectSlot={(resourceId, startTime) =>
          setFormRequest({ resourceId, startTime })
        }
        resources={resources}
      />

      {formRequest && (
        <BookingForm
          date={date}
          initialResourceId={formRequest.resourceId}
          initialStartTime={formRequest.startTime}
          onClose={() => setFormRequest(null)}
          resources={allResources}
        />
      )}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onCancel={() => {
            dispatch(cancelBooking(selectedBooking.id))
            setSelectedBookingId(null)
          }}
          onClose={() => setSelectedBookingId(null)}
          resources={allResources}
        />
      )}
    </main>
  )
}
