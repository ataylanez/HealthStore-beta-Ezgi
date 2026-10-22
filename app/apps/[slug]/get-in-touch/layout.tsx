import { notFound } from 'next/navigation'
import { getAllAppsUnfiltered, getAppBySlug } from '@/lib/data'
import { EoiJourneyProvider } from '@/components/eoi/journey/EoiJourneyProvider'
import { isMarketPreview } from '@/lib/marketPreview'

/**
 * Shared layout for the v2 "Get in touch" journey: the express-interest steps
 * in a different order (start, support, timing, details, check-answers,
 * confirmation) and with no one-time code. v1 stays at /express-interest.
 */

export async function generateStaticParams() {
  return getAllAppsUnfiltered().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const app = getAppBySlug(slug)
  return {
    title: app ? `Get in touch about ${app.app_name} — NHS HealthStore` : 'Not found',
  }
}

export default async function GetInTouchLayout({
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
      flow="v2"
      basePath={`/apps/${app.slug}/get-in-touch`}
    >
      {children}
    </EoiJourneyProvider>
  )
}
