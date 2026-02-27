import { Search, X } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
}

interface Props {
  filters: FilterDef[]
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
      {onSearchChange && (
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {filters.map((filter) => (
        <select
          key={filter.key}
          value={activeFilters[filter.key] || ''}
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
              {opt.count !== undefined ? ` (${opt.count})` : ''}
            </option>
          ))}
        </select>
      ))}

      {Object.values(activeFilters).some(Boolean) && (
        <button
          onClick={() => {
            filters.forEach((f) => onFilterChange(f.key, ''))
          }}
          className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
