import NotFoundContent from '@/components/NotFoundContent'

export const metadata = { title: 'Page not found — NHS HealthStore' }

/** Site-wide 404 (NHS "Page not found" pattern). */
export default function NotFound() {
  return <NotFoundContent />
}
