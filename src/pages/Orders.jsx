import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import AppHeader from '../components/Layout/AppHeader'
import OrderCard from '../components/Orders/OrderCard'
import { SkeletonList } from '../components/UI/Skeleton'
import EmptyState from '../components/UI/EmptyState'
import { useOrders } from '../lib/hooks/useOrders'
import { getProducts } from '../lib/products'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'lost', label: 'Lost' },
]

export default function Orders() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [productFilter, setProductFilter] = useState('')
  const { orders, loading } = useOrders(tab === 'all' ? undefined : tab)

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.clients?.company_name || '').toLowerCase().includes(q) ||
      (o.product_name || '').toLowerCase().includes(q)
    const matchProduct = !productFilter || o.product_name === productFilter
    return matchSearch && matchProduct
  })

  return (
    <div className="pb-20">
      <AppHeader title="Orders" />

      {/* Search + Filter */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders or clients..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none bg-white"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
          >
            <option value="">All Products</option>
            {getProducts().map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mt-3 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              tab === t.key ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders found" message="Create your first order to get started" />
      ) : (
        <div className="px-4 mt-3 flex flex-col gap-2">
          {filtered.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  )
}
