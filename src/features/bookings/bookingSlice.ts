import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Booking } from '../../types'

const today = new Date()
const localDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-')

const atLocalTime = (time: string) => new Date(`${localDate}T${time}:00`).toISOString()

const initialState: { items: Booking[]; selectedDate: string } = {
  selectedDate: localDate,
  items: [
    {
      id: 'booking-aurora-1',
      resourceId: 'room-aurora',
      title: 'Weekly product sync',
      startsAt: atLocalTime('10:00'),
      endsAt: atLocalTime('11:00'),
      status: 'confirmed',
    },
    {
      id: 'booking-aurora-2',
      resourceId: 'room-aurora',
      title: 'Design review',
      startsAt: atLocalTime('14:30'),
      endsAt: atLocalTime('15:30'),
      status: 'confirmed',
    },
    {
      id: 'booking-orbit-1',
      resourceId: 'room-orbit',
      title: 'Quarterly planning',
      startsAt: atLocalTime('09:00'),
      endsAt: atLocalTime('10:30'),
      status: 'confirmed',
    },
  ],
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.items.push(action.payload)
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      const booking = state.items.find(({ id }) => id === action.payload)
      if (booking) {
        booking.status = 'cancelled'
      }
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
  },
})

export const { addBooking, cancelBooking, setSelectedDate } = bookingsSlice.actions
export default bookingsSlice.reducer
