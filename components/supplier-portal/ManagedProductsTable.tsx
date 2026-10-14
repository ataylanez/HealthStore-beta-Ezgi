'use client'

import { MANAGED_PRODUCTS, managedProductHref } from '@/lib/supplierPortal'
import { managedProductStatus, managedProductStatuses } from './portalStatus'
import { StatusTable } from './StatusTable'
import { useSupplierPortal } from './useSupplierPortal'

/** Onboarded products with their current status and last update. */
export default function ManagedProductsTable() {
  const { hydrated, getRecord } = useSupplierPortal()
  if (!hydrated) return null
  return (
    <StatusTable
      caption="Your onboarded products and their status"
      nameHeading="Product"
      dateHeading="Last updated"
      rows={MANAGED_PRODUCTS.map((p) => {
        const record = getRecord('products', p.id)
        const statuses = managedProductStatuses(p, record)
        return {
          id: p.id,
          name: p.name,
          href: managedProductHref(p.id),
          status: managedProductStatus(p, record),
          statuses,
          date: record.lastUpdated ?? p.lastUpdated,
        }
      })}
    />
  )
}
