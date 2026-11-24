import { getConditionAreas, supervisionLabels, type App } from '@/lib/data'

/**
 * Catalogue filter groups, defined as data.
 *
 * To add a filter: append a group here. To hide one temporarily: set
 * `enabled: false` — it disappears from the panel and is ignored when matching,
 * but the panel layout is unchanged so it can be switched back on at any time.
 */

export type FilterOption = { id: string; label: string }

export type FilterGroup = {
  id: string
  /** Fieldset legend and section title. */
  legend: string
  /** `single` renders radios, `multi` renders checkboxes. */
  type: 'single' | 'multi'
  options: FilterOption[]
  /** Single-choice groups only: the "no filter" option (e.g. "All conditions"). */
  defaultValue?: string
  enabled: boolean
  matches: (app: App, value: string) => boolean
}

/** groupId -> selected option ids. Single-choice groups hold at most one value. */
export type FilterSelection = Record<string, string[]>

export type SelectedTag = {
  groupId: string
  groupLegend: string
  value: string
  label: string
}

// No "All conditions" option: nothing selected means all products are shown,
// and "Clear filters" returns to that state.
const conditionOptions: FilterOption[] = getConditionAreas()
  .filter(c => c.id !== 'pulmonary_rehab')
  .map(c => ({
    id: c.id,
    label: c.id === 'copd' ? 'COPD and pulmonary rehab' : c.label,
  }))

export function appMatchesCondition(app: App, conditionId: string): boolean {
  if (conditionId === 'all') return true
  const tags: string[] = app.condition_tags ?? []
  if (conditionId === 'copd') return tags.includes('copd') || tags.includes('pulmonary_rehab')
  return tags.includes(conditionId)
}

export const catalogueFilterGroups: FilterGroup[] = [
  {
    id: 'condition',
    legend: 'Condition',
    type: 'single',
    options: conditionOptions,
    enabled: true,
    matches: appMatchesCondition,
  },
  {
    id: 'supervision',
    legend: 'Supervision model',
    type: 'multi',
    options: Object.entries(supervisionLabels).map(([id, label]) => ({ id, label })),
    // Hidden for now. Set to true to bring the filter back.
    enabled: false,
    matches: (app, value) => app.supervision_model === value,
  },
]

export const activeFilterGroups = catalogueFilterGroups.filter(g => g.enabled)

/** A selection with nothing filtered: every group empty. */
export function emptySelection(groups: FilterGroup[] = activeFilterGroups): FilterSelection {
  return Object.fromEntries(groups.map(g => [g.id, []]))
}

/** Values that actually narrow results (drops a single group's default value). */
function effectiveValues(group: FilterGroup, selection: FilterSelection): string[] {
  return (selection[group.id] ?? []).filter(v => v !== group.defaultValue)
}

export function hasActiveSelection(
  selection: FilterSelection,
  groups: FilterGroup[] = activeFilterGroups,
): boolean {
  return groups.some(g => effectiveValues(g, selection).length > 0)
}

/** AND across groups, OR within a group. */
export function filterApps(
  apps: App[],
  selection: FilterSelection,
  groups: FilterGroup[] = activeFilterGroups,
): App[] {
  return apps.filter(app =>
    groups.every(g => {
      const values = effectiveValues(g, selection)
      return values.length === 0 || values.some(v => g.matches(app, v))
    }),
  )
}

export function selectedTags(
  selection: FilterSelection,
  groups: FilterGroup[] = activeFilterGroups,
): SelectedTag[] {
  return groups.flatMap(g =>
    effectiveValues(g, selection).map(value => ({
      groupId: g.id,
      groupLegend: g.legend,
      value,
      label: g.options.find(o => o.id === value)?.label ?? value,
    })),
  )
}

/** Remove one value from a group. */
export function withoutValue(selection: FilterSelection, groupId: string, value: string): FilterSelection {
  return { ...selection, [groupId]: (selection[groupId] ?? []).filter(v => v !== value) }
}

/**
 * Toggle a value. Single-choice groups hold at most one value: picking another
 * replaces it, picking the selected one again clears the group.
 */
export function withToggledValue(
  selection: FilterSelection,
  group: FilterGroup,
  value: string,
): FilterSelection {
  const current = selection[group.id] ?? []
  if (group.type === 'single') return { ...selection, [group.id]: current.includes(value) ? [] : [value] }
  return {
    ...selection,
    [group.id]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
  }
}
