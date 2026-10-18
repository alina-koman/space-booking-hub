import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Resource, ResourceStatus } from '../../types'

const initialState: Resource[] = [
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
  initialState,
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
