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
