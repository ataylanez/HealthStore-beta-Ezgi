import { describe, expect, it } from 'vitest'
import {
  activeFilterGroups,
  catalogueFilterGroups,
  emptySelection,
  filterApps,
  hasActiveSelection,
  selectedTags,
  withToggledValue,
  withoutValue,
} from '@/lib/catalogueFilters'

const apps = [
  { id: '1', app_name: 'A', condition_tags: ['copd'], supervision_model: 'self_managed' },
  { id: '2', app_name: 'B', condition_tags: ['pulmonary_rehab'], supervision_model: 'clinician_supervised' },
  { id: '3', app_name: 'C', condition_tags: ['heart_failure'], supervision_model: 'self_managed' },
]

const condition = catalogueFilterGroups.find(g => g.id === 'condition')!
const supervision = catalogueFilterGroups.find(g => g.id === 'supervision')!

describe('catalogueFilters', () => {
  it('hides supervision for now but keeps it defined', () => {
    expect(activeFilterGroups.map(g => g.id)).toEqual(['condition'])
    expect(supervision.enabled).toBe(false)
  })

  it('returns everything when nothing is selected', () => {
    expect(filterApps(apps, emptySelection())).toHaveLength(3)
    expect(hasActiveSelection(emptySelection())).toBe(false)
  })

  it('has no "All conditions" option', () => {
    expect(condition.options.some(o => o.id === 'all')).toBe(false)
  })

  it('treats COPD as including pulmonary rehab', () => {
    const ids = filterApps(apps, { condition: ['copd'] }).map(a => a.id)
    expect(ids).toEqual(['1', '2'])
  })

  it('ignores disabled groups when filtering', () => {
    expect(filterApps(apps, { condition: [], supervision: ['clinician_supervised'] })).toHaveLength(3)
  })

  it('ANDs across groups and ORs within a group when enabled', () => {
    const groups = [condition, { ...supervision, enabled: true }]
    const sel = { condition: ['copd'], supervision: ['self_managed'] }
    expect(filterApps(apps, sel, groups).map(a => a.id)).toEqual(['1'])
    const both = { condition: [], supervision: ['self_managed', 'clinician_supervised'] }
    expect(filterApps(apps, both, groups)).toHaveLength(3)
  })

  it('builds labelled tags and skips the default value', () => {
    expect(selectedTags(emptySelection())).toEqual([])
    const [tag] = selectedTags({ condition: ['copd'] })
    expect(tag).toMatchObject({ groupId: 'condition', value: 'copd', label: 'COPD and pulmonary rehab' })
  })

  it('toggles and removes values', () => {
    let sel = withToggledValue(emptySelection(), condition, 'copd')
    sel = withToggledValue(sel, condition, 'heart_failure')
    expect(sel.condition).toEqual(['heart_failure'])
    expect(withoutValue(sel, 'condition', 'heart_failure').condition).toEqual([])

    let multi = withToggledValue({ supervision: [] }, supervision, 'a')
    multi = withToggledValue(multi, supervision, 'b')
    multi = withToggledValue(multi, supervision, 'a')
    expect(multi.supervision).toEqual(['b'])
  })
})
