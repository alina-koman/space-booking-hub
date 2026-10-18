import { useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addBooking, setSelectedDate } from '../features/bookings/bookingSlice'
import { selectHasBookingConflict } from '../features/bookings/selectors'
import {
  END_HOUR,
  SLOT_MINUTES,
  toLocalIso,
  toTime,
} from '../features/bookings/bookingUtils'
import type { Resource } from '../types'

interface BookingFormProps {
  resources: Resource[]
  date: string
  initialResourceId?: string
  initialStartTime?: string
  onClose: () => void
}

export default function BookingForm({
  resources,
  date,
  initialResourceId,
  initialStartTime,
  onClose,
}: BookingFormProps) {
  const dispatch = useAppDispatch()
  const availableRooms = resources.filter(
    (resource) => resource.type === 'room' && resource.status === 'available',
  )
  const devices = resources.filter((resource) => resource.type === 'device')
  const roomOptions = resources.filter((resource) => resource.type === 'room')
  const [bookingDate, setBookingDate] = useState(date)
  const [roomId, setRoomId] = useState(() => {
    const initialRoom = availableRooms.find(({ id }) => id === initialResourceId)
    return initialRoom?.id ?? availableRooms[0]?.id ?? ''
  })
  const [deviceIds, setDeviceIds] = useState<string[]>(() => {
    const initialDevice = devices.find(
      ({ id, status }) => id === initialResourceId && status === 'available',
    )
    return initialDevice ? [initialDevice.id] : []
  })
  const [startTime, setStartTime] = useState(initialStartTime ?? '09:00')
  const [endTime, setEndTime] = useState(() => {
    const start = initialStartTime
      ? Number(initialStartTime.slice(0, 2)) * 60 + Number(initialStartTime.slice(3))
      : 9 * 60
    return toTime(Math.min(start + 60, END_HOUR * 60))
  })
  const [title, setTitle] = useState('')

  const selectedResourceIds = [roomId, ...deviceIds].filter(Boolean)
  const validInterval = startTime !== '' && endTime !== '' && endTime > startTime
  const conflict = useAppSelector((state) =>
    validInterval && selectedResourceIds.length > 0
      ? selectHasBookingConflict(
          state,
          selectedResourceIds,
          toLocalIso(bookingDate, startTime),
          toLocalIso(bookingDate, endTime),
        )
      : false,
  )
  const selectedResourcesAvailable =
    Boolean(roomId) &&
    selectedResourceIds.every((id) =>
      resources.some(({ id: resourceId, status }) => resourceId === id && status === 'available'),
    )
  const canSubmit =
    selectedResourcesAvailable && Boolean(title.trim() && validInterval) && !conflict

  const toggleDevice = (deviceId: string) => {
    setDeviceIds((currentIds) =>
      currentIds.includes(deviceId)
        ? currentIds.filter((id) => id !== deviceId)
        : [...currentIds, deviceId],
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    dispatch(
      addBooking({
        id: crypto.randomUUID(),
        resourceIds: selectedResourceIds,
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
        {availableRooms.length === 0 ? (
          <p>Немає доступних кімнат для бронювання.</p>
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
              Кімната
              <select onChange={(event) => setRoomId(event.target.value)} value={roomId}>
                {roomOptions.map((resource) => (
                  <option
                    disabled={resource.status !== 'available'}
                    key={resource.id}
                    value={resource.id}
                  >
                    {resource.name}
                    {resource.status !== 'available' ? ' · на обслуговуванні' : ''}
                  </option>
                ))}
              </select>
            </label>
            <p className="form-hint">
              Обери кімнату та, за потреби, додай обладнання до цього бронювання.
            </p>
            {devices.length > 0 && (
              <fieldset className="device-picker">
                <legend>Обладнання</legend>
                <div className="device-options">
                  {devices.map((device) => (
                    <label
                      className={device.status === 'available' ? '' : 'device-unavailable'}
                      key={device.id}
                    >
                      <input
                        checked={deviceIds.includes(device.id)}
                        disabled={device.status !== 'available'}
                        onChange={() => toggleDevice(device.id)}
                        type="checkbox"
                      />
                      <span>{device.name}</span>
                      {device.status !== 'available' && (
                        <small>На обслуговуванні</small>
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {conflict && (
              <p className="form-error" role="alert">
                Кімната або одне з обраних пристроїв уже заброньовані на цей час.
              </p>
            )}
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
                  min="08:00"
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
                  max="20:00"
                  min="08:30"
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
