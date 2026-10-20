import myCOPD from '@/content/apps/mycopd.json'
import clinitouch from '@/content/apps/clinitouch.json'
import copdhub from '@/content/apps/copdhub.json'
import luscii from '@/content/apps/luscii.json'
import sleepio from '@/content/apps/sleepio.json'
import otherAppsData from '@/content/apps/other-apps.json'
import jointAcademy from '@/content/apps/joint-academy.json'
import w8buddy from '@/content/apps/w8buddy.json'
import overcomingAnorexia from '@/content/apps/overcoming-anorexia.json'
import activateYourHeart from '@/content/apps/activate-your-heart.json'
import dReachHf from '@/content/apps/d-reach-hf.json'
import digitalHeartManual from '@/content/apps/digital-heart-manual.json'
import groHealthHeartbuddy from '@/content/apps/gro-health-heartbuddy.json'
import kiactiv from '@/content/apps/kiactiv.json'
import myheart from '@/content/apps/myheart.json'
import pumpingMarvellous from '@/content/apps/pumping-marvellous.json'
import wellinks from '@/content/apps/wellinks.json'
import fundingData from '@/content/funding/funding.json'
import conditionsData from '@/content/conditions/conditions.json'
import dashboardData from '@/content/dashboard/dashboard.json'
import homeNewsData from '@/content/home/news.json'
import homeEvidenceData from '@/content/home/evidence-spotlights.json'
import homeCampaignsData from '@/content/home/campaigns.json'
import conceptGridData from '@/content/home/concept-grid.json'
import conceptFeaturedData from '@/content/home/concept-featured.json'
import type { CaseStudy, ConceptFeaturedContent, ConceptGridContent } from '@/lib/conceptHomeTypes'
import type { HomeCampaignItem, HomeEvidenceSpotlight, HomeNewsItem } from '@/lib/homeContentTypes'
import { isMarketPreview } from '@/lib/marketPreview'
import { isVisibleCondition } from '@/lib/visibleConditions'

/** App JSON: `service_wrap_description` is preferred; `service_wrap_note` is legacy — PDP merges both for “Service wrap details”. Optional `named_sites`: `{ name, status: active|decommissioned|unknown }[]` for **Live sites** on PDP (info tooltip derives placeholder email via `lib/liveSiteContact.ts`); legacy `live_sites` string when structured rows absent. */
export type App = any

/** Standard fallback when profile fields are empty or unknown. */
export const CHECK_WITH_SUPPLIER = 'Check with supplier'
export type Funding = any
export type Condition = any

export type { HomeCampaignItem, HomeEvidenceSpotlight, HomeNewsItem } from '@/lib/homeContentTypes'
export { VISIBLE_CONDITIONS } from '@/lib/visibleConditions'

export function getHomeNews(): HomeNewsItem[] {
  return (homeNewsData as { items: HomeNewsItem[] }).items ?? []
}

export function getHomeEvidenceSpotlights(): HomeEvidenceSpotlight[] {
  return (homeEvidenceData as { items: HomeEvidenceSpotlight[] }).items ?? []
}

export function getHomeCampaigns(): HomeCampaignItem[] {
  return (homeCampaignsData as { items: HomeCampaignItem[] }).items ?? []
}

export function getConceptGridContent(): ConceptGridContent {
  return conceptGridData as ConceptGridContent
}

export function getConceptFeaturedContent(): ConceptFeaturedContent {
  return conceptFeaturedData as ConceptFeaturedContent
}

/** Case studies surfaced on the home band and the /case-studies page, derived from the concept-grid story + promos. */
export function getHomeCaseStudies(): CaseStudy[] {
  const grid = getConceptGridContent()
  const story: CaseStudy = {
    id: 'story',
    title: grid.story.title,
    image: grid.story.image,
    image_alt: grid.story.alt,
    href: grid.story.href,
  }
  const promos: CaseStudy[] = grid.promos.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    image_alt: p.image_alt,
    href: p.href,
  }))

  const featured = getConceptFeaturedContent()
  const featuredApp = getAppBySlug(featured.featured_app_slug)
  const featuredStudy: CaseStudy = {
    id: 'featured-app',
    title: featuredApp?.app_name ? `${featuredApp.app_name}: ${featured.headline}` : featured.headline,
    description: featured.body,
    image: featured.right_image,
    image_alt: featured.right_image_alt,
    href: `/apps/${featured.featured_app_slug}`,
  }

  return [story, ...promos, featuredStudy]
}

const otherApps = otherAppsData as App[]

const allAppsUnfiltered: App[] = [myCOPD, clinitouch, copdhub, luscii, sleepio, ...otherApps, jointAcademy, w8buddy, overcomingAnorexia, activateYourHeart, dReachHf, digitalHeartManual, groHealthHeartbuddy, kiactiv, myheart, pumpingMarvellous, wellinks]

/**
 * Temporary catalogue allowlist — only these PDPs are surfaced in listings and
 * condition counts. Set to `null` to show every product again.
 */
const VISIBLE_APP_SLUGS: string[] | null = ['luscii', 'myheart', 'mycopd', 'wellinks']

export function getAllApps(): App[] {
  if (!VISIBLE_APP_SLUGS) return allAppsUnfiltered
  return allAppsUnfiltered.filter((a: App) => VISIBLE_APP_SLUGS.includes(a.slug))
}

export function getRemovedApps() {
  return [
    { app_name: 'COPDPredict', supplier_name: 'Lenus Health', removal_date: '2024', reason: 'Company ceased trading — Lenus Health entered administration in 2024.', condition: 'COPD' },
    { app_name: 'Active+me REMOTE', supplier_name: 'Spirit Health', removal_date: '2025', reason: 'Product discontinued. Spirit Health now focuses on Clinitouch Vie.', condition: 'COPD' },
  ]
}

export function getConditionAreas(): { id: string; label: string; colour: string; count: number; icon: string }[] {
  const apps = getAllApps()
  return (conditionsData as Condition[])
    .filter((c) => isVisibleCondition(c.id))
    .map(c => ({
      id: c.id,
      label: c.label,
      colour: c.colour,
      icon: c.icon,
      count: apps.filter((a: App) => !isMarketPreview(a) && a.condition_tags.includes(c.id)).length,
    }))
}

export function getOpenFunding(): Funding[] {
  return (fundingData as Funding[]).filter(
    (f: Funding) => f.status === 'open' || f.status === 'upcoming' || f.status === 'periodic',
  )
}

export function getLinkedFunding(appFundingIds: string[]): Funding[] {
  if (!appFundingIds?.length) return []
  return (fundingData as Funding[]).filter((f: Funding) => appFundingIds.includes(f.id))
}

/** PDP / commissioner views: cash or adoption support for ICBs/ICS — excludes obligations and supplier R&D rows. */
export function getCommissionerFacingFunding(appFundingIds: string[]): Funding[] {
  return getLinkedFunding(appFundingIds).filter((f: Funding) => {
    const d = (f as { commissioner_display?: string }).commissioner_display
    return d === 'funding_and_adoption'
  })
}

/**
 * Every product loaded from JSON, ignoring catalogue visibility rules (COPD/CR slice, condition gates).
 * Use for PDP resolution by slug and static generation so hidden/filtered apps share the same UI as visible ones.
 */
export function getAllAppsUnfiltered(): App[] {
  return allAppsUnfiltered
}

export function getAppBySlug(slug: string): App | undefined {
  return allAppsUnfiltered.find((a: App) => a.slug === slug)
}

export function getAppsByCondition(conditionId: string): App[] {
  return getAllApps().filter((a: App) => a.condition_tags.includes(conditionId))
}

export function getAllFunding(): Funding[] {
  return fundingData as Funding[]
}

export function getAllConditions(): Condition[] {
  return conditionsData as Condition[]
}

export function getDashboardContent() {
  return dashboardData
}

export function getDashboardStats() {
  const apps = getAllApps()
  const conditions = getConditionAreas()
  const openFunding = getOpenFunding()

  const niceRefs = new Set<string>()
  apps.forEach((a: App) => {
    (a.nice_guidance_refs ?? []).forEach((r: any) => niceRefs.add(r.ref))
  })

  return [
    { value: String(apps.length), label: 'Apps in catalogue', sublabel: `across ${conditions.length} condition areas` },
    { value: String(niceRefs.size), label: 'NICE guidance references', sublabel: 'HTG and EVA recommendations' },
    { value: String(apps.filter((a: App) => a.condition_tags.includes('copd')).length), label: 'COPD apps', sublabel: 'including technologies that are not commissionable' },
    { value: String(openFunding.length), label: 'Funding opportunities', sublabel: 'currently open or upcoming' },
  ]
}

export const supervisionLabels: Record<string, string> = {
  self_management_only: 'Self-management',
  guided_self_help: 'Guided self-help',
  non_continuous_review: 'Non-continuous review',
  active_remote_management: 'Remote management',
}

export const maturityLabels: Record<string, string> = {
  scaled: 'Established',
  multi_site_live: 'Established',
  limited_live: 'Emerging',
  pilot: 'Pilot',
}

export const effortLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const evidenceLabels: Record<string, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  low: 'Low',
}

export const dtacLabels: Record<string, string> = {
  passed: 'Completed',
  passed_refresh_required: 'Completed – refresh required',
  required_not_confirmed: 'Not confirmed',
  not_applicable: 'N/A',
}
