/**
 * Allowlist of PDP share region keys (must match `shareKey` on expanders / `PdpShareRegion`).
 * Used to validate share-link JWT payloads and API requests.
 */
export const PDP_SHARE_KEYS = [
  'hero',
  'commissioning-snapshot',
  'overview',
  'why-it-matters',
  'context-of-use',
  'scale-and-maturity',
  'what-it-takes-locally',
  'expected-impact',
  'clinical-evidence',
  'nice-guidance',
  'data-quality-flags',
  'demo-access',
  'safety-governance',
  'nhs-integrations',
  'commercial-model',
  'indicative-financial',
  'related-funding',
  'sidebar-summary',
] as const

export type PdpShareKey = (typeof PDP_SHARE_KEYS)[number]

export const PDP_SHARE_KEY_SET = new Set<string>(PDP_SHARE_KEYS)

/** Visual / DOM order on the PDP (Share modal and print lists use this). */
const PDP_SHARE_KEY_ORDER = PDP_SHARE_KEYS as readonly string[]

/** Sort registered blocks to match PDP order; unknown keys last, then alphabetical. */
export function sortPdpShareBlocksByPageOrder<T extends { key: string }>(blocks: T[]): T[] {
  return [...blocks].sort((x, y) => {
    const ia = PDP_SHARE_KEY_ORDER.indexOf(x.key)
    const ib = PDP_SHARE_KEY_ORDER.indexOf(y.key)
    const unkX = ia < 0
    const unkY = ib < 0
    if (unkX && unkY) return x.key.localeCompare(y.key)
    if (unkX) return 1
    if (unkY) return -1
    return ia - ib
  })
}

export function isValidPdpShareKey(k: string): k is PdpShareKey {
  return PDP_SHARE_KEY_SET.has(k)
}

export function normalizeAndValidateShareKeys(keys: unknown): string[] | null {
  if (!Array.isArray(keys) || keys.length === 0) return null
  const out: string[] = []
  const seen = new Set<string>()
  for (const k of keys) {
    if (typeof k !== 'string' || !isValidPdpShareKey(k)) continue
    if (seen.has(k)) continue
    seen.add(k)
    out.push(k)
  }
  return out.length > 0 ? out : null
}

/** Human labels for share modal, print, and shared-view summary (keep aligned with PDP). */
export const PDP_SHARE_SECTION_LABELS: Record<PdpShareKey, string> = {
  hero: 'Product summary',
  'commissioning-snapshot': 'Commissioning snapshot',
  overview: 'Plain-English overview',
  'why-it-matters': 'Why it matters locally',
  'context-of-use': 'Context of use',
  'scale-and-maturity': 'Scale and maturity',
  'what-it-takes-locally': 'What it takes locally',
  'expected-impact': 'Expected impact and case studies',
  'clinical-evidence': 'Clinical evidence',
  'nice-guidance': 'NICE guidance',
  'data-quality-flags': 'Data quality flags',
  'demo-access': 'Demo access',
  'safety-governance': 'Safety and governance',
  'nhs-integrations': 'NHS and care system integrations',
  'commercial-model': 'Commercial model and cost',
  'indicative-financial': 'Indicative financial context',
  'related-funding': 'Related funding opportunities',
  'sidebar-summary': 'Quick facts, assurance, supplier email and sources',
}
