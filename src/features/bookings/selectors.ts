import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { Booking } from '../../types'

const localDateKey = (value: string) => {
  const date = new Date(value)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export const selectHasBookingConflict = createSelector(
  [
    (state: RootState) => state.bookings.items,
    (_state: RootState, resourceId: string) => resourceId,
    (_state: RootState, _resourceId: string, startsAt: string) => startsAt,
    (
      _state: RootState,
      _resourceId: string,
      _startsAt: string,
      endsAt: string,
    ) => endsAt,
  ],
  (bookings, resourceId, startsAt, endsAt) =>
    bookings.some(
      (booking) =>
        booking.status === 'confirmed' &&
        booking.resourceId === resourceId &&
        new Date(booking.startsAt).getTime() < new Date(endsAt).getTime() &&
        new Date(booking.endsAt).getTime() > new Date(startsAt).getTime(),
    ),
)

export const selectBookingsForDate = createSelector(
  [
    (state: RootState) => state.bookings.items,
    (_state: RootState, date: string) => date,
  ],
  (bookings, date) =>
    bookings.filter(
      (booking) =>
        booking.status === 'confirmed' &&
        localDateKey(booking.startsAt) === date,
    ),
)

export const createSelectCompatibleSlots = (resourceIds: string[], date: string) =>
  createSelector([(state: RootState) => state.bookings.items], (bookings) => {
    if (resourceIds.length === 0) {
      return []
    }

    const slots: string[] = []
    for (let minutes = 8 * 60; minutes < 20 * 60; minutes += 30) {
      const startsAt = new Date(
        `${date}T${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:00`,
      )
      const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)
      const hasConflict = bookings.some(
        (booking: Booking) =>
          booking.status === 'confirmed' &&
          resourceIds.includes(booking.resourceId) &&
          new Date(booking.startsAt) < endsAt &&
          new Date(booking.endsAt) > startsAt,
      )

      if (!hasConflict) {
        slots.push(
          `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
        )
      }
    }
    return slots
  })
