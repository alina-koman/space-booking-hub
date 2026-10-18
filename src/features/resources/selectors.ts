import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export const selectFilteredResources = createSelector(
  [
    (state: RootState) => state.resources,
    (state: RootState) => state.filters.query.trim().toLowerCase(),
    (state: RootState) => state.filters.type,
    (state: RootState) => state.filters.equipment,
  ],
  (resources, query, type, equipment) =>
    resources.filter((resource) => {
      const matchesQuery = resource.name.toLowerCase().includes(query)
      const matchesType = type === 'all' || resource.type === type
      const matchesEquipment = equipment.every((item) => resource.equipment.includes(item))
      return matchesQuery && matchesType && matchesEquipment
    }),
)
