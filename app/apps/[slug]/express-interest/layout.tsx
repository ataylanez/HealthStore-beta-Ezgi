import { notFound } from 'next/navigation'
import { getAllAppsUnfiltered, getAppBySlug } from '@/lib/data'
import { EoiJourneyProvider } from '@/components/eoi/journey/EoiJourneyProvider'
import { isMarketPreview } from '@/lib/marketPreview'

/**
 * Shared layout for the express-interest journey. Resolves the app once and
 * mounts the journey provider, which stays alive as the user moves between the
 * step routes (details, verify, support, timing, check-answers, confirmation).
 */

export async function generateStaticParams() {
  return getAllAppsUnfiltered().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const app = getAppBySlug(slug)
  return {
    title: app ? `Express interest in ${app.app_name} — NHS HealthStore` : 'Not found',
  }
}

export default async function ExpressInterestLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const app = getAppBySlug(slug)
  if (!app || isMarketPreview(app)) notFound()

  return (
    <EoiJourneyProvider
      app={{ id: app.id, name: app.app_name, slug: app.slug }}
      flow="v1"
      basePath={`/apps/${app.slug}/express-interest`}
    >
      {children}
    </EoiJourneyProvider>
  )
}
