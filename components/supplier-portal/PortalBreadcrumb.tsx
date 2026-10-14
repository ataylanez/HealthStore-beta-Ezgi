import { PageBreadcrumb, type PageBreadcrumbItem } from '@/components/PageBreadcrumb'
import { PORTAL_PATHS } from '@/lib/supplierPortal'

/**
 * NHS Breadcrumb rooted at the Supplier portal dashboard instead of the
 * Commissioning Store home page. Pass the trail after Dashboard, ending with
 * the current page (omitted from the rendered crumbs, per the NHS pattern).
 */
export function PortalBreadcrumb({ items }: { items: PageBreadcrumbItem[] }) {
  return <PageBreadcrumb includeHome={false} items={[{ label: 'Dashboard', href: PORTAL_PATHS.dashboard }, ...items]} />
}
