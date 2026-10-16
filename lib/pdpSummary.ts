import type { ProductNarrative } from '@/lib/content/productModel'

/**
 * Products using the summary-style overview page (hero + per-section teasers,
 * no snapshot or action buttons). Luscii only for now; roll out to other
 * products in a future iteration.
 */
const SUMMARY_OVERVIEW_SLUGS: ReadonlySet<string> = new Set(['luscii'])

export function usesSummaryOverview(slug: string): boolean {
  return SUMMARY_OVERVIEW_SLUGS.has(slug)
}

type SummaryApp = {
  slug: string
  overview?: unknown
  one_line_value_proposition?: string
}

/** First plain-English overview paragraph, if authored in content/apps/{slug}.json. */
export function overviewParagraphs(app: SummaryApp): string[] {
  return Array.isArray(app.overview) ? app.overview.filter((p): p is string => typeof p === 'string' && p.length > 0) : []
}

/**
 * The product summary shown in the overview hero. Summary-overview products use
 * the first overview paragraph; other products keep the narrative one-liner.
 */
export function productSummary(app: SummaryApp, narrative: ProductNarrative | null): string {
  if (usesSummaryOverview(app.slug)) {
    const first = overviewParagraphs(app)[0]
    if (first) return first
  }
  return narrative?.decision_summary?.one_line_proposition ?? app.one_line_value_proposition ?? ''
}

/** First sentence of a paragraph (keeps abbreviations like "e.g." intact where possible). */
export function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s+[A-Z(]|\s*$)/)
  return (match ? match[0] : text).trim()
}

/** Short summary for catalogue cards. */
export function catalogueSummary(app: SummaryApp, narrative: ProductNarrative | null): string {
  const summary = productSummary(app, narrative)
  return usesSummaryOverview(app.slug) ? firstSentence(summary) : summary
}
