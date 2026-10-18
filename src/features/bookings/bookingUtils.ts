export const START_HOUR = 8
export const END_HOUR = 20
export const SLOT_MINUTES = 30
export const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60

export const timeSlots = Array.from(
  { length: TOTAL_MINUTES / SLOT_MINUTES },
  (_, index) => index * SLOT_MINUTES,
)

export const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export const toLocalIso = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString()

export const minutesOfDay = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.getHours() * 60 + date.getMinutes()
}

export const changeDate = (date: string, amount: number) => {
  const nextDate = new Date(`${date}T12:00:00`)
  nextDate.setDate(nextDate.getDate() + amount)
  return [
    nextDate.getFullYear(),
    String(nextDate.getMonth() + 1).padStart(2, '0'),
    String(nextDate.getDate()).padStart(2, '0'),
  ].join('-')
}

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))

export const getBookingColorClass = (bookingId: string) => {
  const hash = [...bookingId].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  )
  return `booking-color-${hash % 6}`
}

export const formatBookingDate = (dateTime: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateTime))

export const formatBookingTime = (dateTime: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateTime))
