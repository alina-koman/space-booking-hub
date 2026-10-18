import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Resource, ResourceStatus } from '../../types'

export const initialResources: Resource[] = [
  {
    id: 'room-aurora',
    name: 'Aurora',
    type: 'room',
    capacity: 8,
    equipment: ['4K display', 'Whiteboard', 'Video conferencing'],
    status: 'available',
  },
  {
    id: 'room-orbit',
    name: 'Orbit',
    type: 'room',
    capacity: 12,
    equipment: ['Projector', 'Whiteboard'],
    status: 'available',
  },
  {
    id: 'room-nova',
    name: 'Nova',
    type: 'room',
    capacity: 4,
    equipment: ['4K display'],
    status: 'available',
  },
  {
    id: 'device-projector',
    name: 'Portable projector',
    type: 'device',
    capacity: 0,
    equipment: ['4K', 'HDMI'],
    status: 'available',
  },
  {
    id: 'device-microphone',
    name: 'Wireless microphone',
    type: 'device',
    capacity: 0,
    equipment: ['Bluetooth', 'USB-C'],
    status: 'available',
  },
  {
    id: 'device-speakerphone',
    name: 'Conference speakerphone',
    type: 'device',
    capacity: 0,
    equipment: ['Bluetooth', 'Noise cancellation'],
    status: 'available',
  },
  {
    id: 'device-webcam',
    name: 'HD webcam',
    type: 'device',
    capacity: 0,
    equipment: ['1080p', 'USB-C'],
    status: 'available',
  },
  {
    id: 'device-monitor',
    name: 'Portable 4K monitor',
    type: 'device',
    capacity: 0,
    equipment: ['4K', 'HDMI', 'USB-C'],
    status: 'available',
  },
  {
    id: 'device-camera',
    name: 'Conference camera',
    type: 'device',
    capacity: 0,
    equipment: ['4K', 'USB-C'],
    status: 'maintenance',
  },
]

const resourcesSlice = createSlice({
  name: 'resources',
  initialState: initialResources,
  reducers: {
    addResource: (state, action: PayloadAction<Resource>) => {
      state.push(action.payload)
    },
    updateResourceStatus: (
      state,
      action: PayloadAction<{ id: string; status: ResourceStatus }>,
    ) => {
      const resource = state.find(({ id }) => id === action.payload.id)
      if (resource) {
        resource.status = action.payload.status
      }
    },
  },
})

export const { addResource, updateResourceStatus } = resourcesSlice.actions
export default resourcesSlice.reducer
