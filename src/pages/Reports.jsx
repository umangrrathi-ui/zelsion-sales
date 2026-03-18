import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, STAGES, getStageIndex } from '../lib/utils'
import AppHeader from '../components/Layout/AppHeader'
import { SkeletonList } from '../components/UI/Skeleton'
import { TrendingUp, TrendingDown, IndianRupee, Package, Users, BarChart3, PieChart } from 'lucide-react'

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('this_month')
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    activeClients: 0,
    stageBreakdown: [],
    productBreakdown: [],
    monthlyTrend: [],
    topClients: [],
    lostOrders: 0,
    completedOrders: 0,
  })

  useEffect(() => {
    loadReports()
  }, [period])

  function getDateRange() {
    const now = new Date()
    let start
    if (period === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      now.setDate(0) // last day of previous month
    } else if (period === 'this_quarter') {
      const q = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), q * 3, 1)
    } else if (period === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1)
    } else {
      start = new Date(2020, 0, 1) // all time
    }
    return { start: start.toISOString(), end: now.toISOString() }
  }

  async function loadReports() {
    setLoading(true)
    const { start, end } = getDateRange()

    const [ordersRes, clientsRes, allOrdersRes] = await Promise.all([
      supabase.from('sales_orders')
        .select('*, clients(company_name)')
        .gte('created_at', start)
        .lte('created_at', end),
      supabase.from('clients').select('id', { count: 'exact' }),
      supabase.from('sales_orders').select('current_stage, total_amount, product_name, clients(company_name)')
    ])

    const orders = ordersRes.data || []
    const allOrders = allOrdersRes.data || []

    // Total revenue (from completed orders with total_amount)
    const completedOrders = orders.filter(o => o.current_stage === 'completed')
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    const lostOrders = orders.filter(o => o.followup_status === 'Lost').length
    const convertedOrders = orders.filter(o => getStageIndex(o.current_stage) >= 3).length // past PO stage
    const conversionRate = orders.length > 0 ? Math.round((convertedOrders / orders.length) * 100) : 0

    // Stage breakdown (from all orders)
    const stageCounts = {}
    allOrders.forEach(o => {
      stageCounts[o.current_stage] = (stageCounts[o.current_stage] || 0) + 1
    })
    const stageBreakdown = STAGES.map(s => ({
      label: s.label,
      key: s.key,
      count: stageCounts[s.key] || 0,
      icon: s.icon,
    })).filter(s => s.count > 0)

    // Product breakdown
    const productCounts = {}
    orders.forEach(o => {
      if (o.product_name) {
        productCounts[o.product_name] = (productCounts[o.product_name] || 0) + 1
      }
    })
    const productBreakdown = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Top clients by number of orders
    const clientCounts = {}
    allOrders.forEach(o => {
      const name = o.clients?.company_name || 'Unknown'
      clientCounts[name] = (clientCounts[name] || 0) + 1
    })
    const topClients = Object.entries(clientCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setStats({
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue,
      conversionRate,
      activeClients: clientsRes.count || 0,
      stageBreakdown,
      productBreakdown,
      topClients,
      lostOrders,
      completedOrders: completedOrders.length,
    })
    setLoading(false)
  }

  const periods = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'this_quarter', label: 'Quarter' },
    { key: 'this_year', label: 'Year' },
    { key: 'all', label: 'All Time' },
  ]

  if (loading) return (
    <>
      <AppHeader title="Reports" showBack />
      <SkeletonList count={8} />
    </>
  )

  const kpiCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'bg-blue-500' },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Avg Order Value', value: formatCurrency(stats.avgOrderValue), icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: BarChart3, color: 'bg-amber-500' },
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'bg-cyan-500' },
    { label: 'Completed', value: stats.completedOrders, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Lost', value: stats.lostOrders, icon: TrendingDown, color: 'bg-red-500' },
  ]

  return (
    <div className="pb-20">
      <AppHeader title="Reports" showBack />

      {/* Period Filter */}
      <div className="flex gap-1.5 px-4 pt-4 overflow-x-auto pb-1">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              period === p.key ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {kpiCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Pipeline / Stage Breakdown */}
      {stats.stageBreakdown.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <PieChart size={18} className="text-navy" /> Pipeline Breakdown
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {stats.stageBreakdown.map((stage, i) => {
              const maxCount = Math.max(...stats.stageBreakdown.map(s => s.count))
              const pct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
              return (
                <div key={stage.key} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <span className="text-base">{stage.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 truncate">{stage.label}</span>
                      <span className="text-sm font-semibold text-gray-900 ml-2">{stage.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-navy rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Product Breakdown */}
      {stats.productBreakdown.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-navy" /> By Product
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {stats.productBreakdown.map((product, i) => (
              <div key={product.name} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                <span className="text-sm text-gray-700">{product.name}</span>
                <span className="text-sm font-semibold bg-navy/10 text-navy px-3 py-1 rounded-full">{product.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Clients */}
      {stats.topClients.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users size={18} className="text-navy" /> Top Clients
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {stats.topClients.map((client, i) => (
              <div key={client.name} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-gray-700">{client.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{client.count} orders</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
