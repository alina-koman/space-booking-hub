import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  setQuery,
  setResourceType,
  toggleEquipment,
} from '../features/filters/filterSlice'
import type { ResourceType } from '../types'

interface ResourceFiltersProps {
  equipmentOptions: string[]
}

export default function ResourceFilters({ equipmentOptions }: ResourceFiltersProps) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filters)

  return (
    <section aria-label="Фільтри ресурсів" className="filter-panel">
      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <input
          onChange={(event) => dispatch(setQuery(event.target.value))}
          placeholder="Пошук ресурсів..."
          value={filters.query}
        />
      </label>
      <label className="type-filter">
        <span>Тип ресурсу</span>
        <select
          onChange={(event) =>
            dispatch(setResourceType(event.target.value as ResourceType | 'all'))
          }
          value={filters.type}
        >
          <option value="all">Усі ресурси</option>
          <option value="room">Кімнати</option>
          <option value="device">Обладнання</option>
        </select>
      </label>
      <div className="equipment-filters">
        <span>Обладнання</span>
        <div className="equipment-options">
          {equipmentOptions.map((item) => (
            <label className="checkbox-filter" key={item}>
              <input
                checked={filters.equipment.includes(item)}
                onChange={() => dispatch(toggleEquipment(item))}
                type="checkbox"
              />
              {item}
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
