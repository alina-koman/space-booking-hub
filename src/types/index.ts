export type ResourceType = 'room' | 'device'

export type ResourceStatus = 'available' | 'maintenance'

export interface Resource {
  id: string
  name: string
  type: ResourceType
  capacity: number
  equipment: string[]
  status: ResourceStatus
}

export interface Booking {
  id: string
  resourceIds: string[]
  title: string
  startsAt: string
  endsAt: string
  status: 'confirmed' | 'cancelled'
}
