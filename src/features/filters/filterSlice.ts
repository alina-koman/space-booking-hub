import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ResourceType } from '../../types/resource'

interface FilterState {
  query: string
  type: ResourceType | 'all'
  equipment: string[]
}

const initialState: FilterState = {
  query: '',
  type: 'all',
  equipment: [],
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    setResourceType: (state, action: PayloadAction<FilterState['type']>) => {
      state.type = action.payload
    },
    toggleEquipment: (state, action: PayloadAction<string>) => {
      if (state.equipment.includes(action.payload)) {
        state.equipment = state.equipment.filter((item) => item !== action.payload)
      } else {
        state.equipment.push(action.payload)
      }
    },
  },
})

export const { setQuery, setResourceType, toggleEquipment } = filtersSlice.actions
export default filtersSlice.reducer
