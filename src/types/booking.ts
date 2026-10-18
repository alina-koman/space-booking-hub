export interface Booking {
  id: string
  resourceIds: string[]
  title: string
  startsAt: string
  endsAt: string
  status: 'confirmed' | 'cancelled'
}
