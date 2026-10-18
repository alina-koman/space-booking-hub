import { configureStore } from '@reduxjs/toolkit'
import bookingsReducer from '../features/bookings/bookingSlice'
import filtersReducer from '../features/filters/filterSlice'
import {
  initialResources,
  default as resourcesReducer,
} from '../features/resources/resourceSlice'
import type { Booking } from '../types/booking'
import type { Resource } from '../types/resource'

const STORAGE_KEY = 'spacebook-state'

interface PersistedState {
  resources: Resource[]
  bookings: {
    items: Booking[]
    selectedDate: string
  }
}

type PersistedBooking = Omit<Booking, 'resourceIds'> & {
  resourceIds?: string[]
  resourceId?: string
}

const isResource = (value: unknown): value is Resource => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const resource = value as Record<string, unknown>
  return (
    typeof resource.id === 'string' &&
    typeof resource.name === 'string' &&
    (resource.type === 'room' || resource.type === 'device') &&
    typeof resource.capacity === 'number' &&
    Array.isArray(resource.equipment) &&
    resource.equipment.every((item) => typeof item === 'string') &&
    (resource.status === 'available' || resource.status === 'maintenance')
  )
}

const isResourceArray = (value: unknown): value is Resource[] =>
  Array.isArray(value) && value.every(isResource)

const isBooking = (value: unknown): value is PersistedBooking => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const booking = value as Record<string, unknown>
  const hasResourceIds =
    Array.isArray(booking.resourceIds) &&
    booking.resourceIds.length > 0 &&
    booking.resourceIds.every((resourceId) => typeof resourceId === 'string')
  const hasLegacyResourceId =
    typeof booking.resourceId === 'string' && booking.resourceId.length > 0

  return (
    typeof booking.id === 'string' &&
    (hasResourceIds || hasLegacyResourceId) &&
    typeof booking.title === 'string' &&
    typeof booking.startsAt === 'string' &&
    !Number.isNaN(Date.parse(booking.startsAt)) &&
    typeof booking.endsAt === 'string' &&
    !Number.isNaN(Date.parse(booking.endsAt)) &&
    (booking.status === 'confirmed' || booking.status === 'cancelled')
  )
}

const normalizeBooking = (booking: PersistedBooking): Booking => ({
  id: booking.id,
  resourceIds: booking.resourceIds ?? (booking.resourceId ? [booking.resourceId] : []),
  title: booking.title,
  startsAt: booking.startsAt,
  endsAt: booking.endsAt,
  status: booking.status,
})

const loadPersistedState = (): PersistedState | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (storedValue === null) {
      return undefined
    }

    const parsed: unknown = JSON.parse(storedValue)
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Saved state must be an object.')
    }

    const state = parsed as Record<string, unknown>
    const bookings = state.bookings
    if (
      !isResourceArray(state.resources) ||
      typeof bookings !== 'object' ||
      bookings === null
    ) {
      throw new Error('Saved resources or bookings have an invalid format.')
    }

    const savedResources = state.resources
    const savedBookings = bookings as Record<string, unknown>
    if (
      !Array.isArray(savedBookings.items) ||
      !savedBookings.items.every(isBooking) ||
      typeof savedBookings.selectedDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(savedBookings.selectedDate)
    ) {
      throw new Error('Saved booking data has an invalid format.')
    }

    return {
      resources: [
        ...savedResources,
        ...initialResources.filter(
          ({ id }) => !savedResources.some((resource) => resource.id === id),
        ),
      ],
      bookings: {
        items: savedBookings.items.map(normalizeBooking),
        selectedDate: savedBookings.selectedDate,
      },
    }
  } catch (error) {
    console.warn('Could not restore Spacebook data; using sample data instead.', error)
    return undefined
  }
}

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    bookings: bookingsReducer,
    filters: filtersReducer,
  },
  preloadedState: loadPersistedState(),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

store.subscribe(() => {
  if (typeof window === 'undefined') {
    return
  }

  const { resources, bookings } = store.getState()
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ resources, bookings }),
    )
  } catch (error) {
    console.error('Could not save Spacebook data to local storage.', error)
  }
})