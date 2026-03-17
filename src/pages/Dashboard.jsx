import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, CalendarClock, AlertTriangle, CreditCard, Plus, ListChecks } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { daysSince, isOverdue, isToday, formatDateShort, getStageInfo } from '../lib/utils'
import AppHeader from '../components/Layout/AppHeader'
import StageBadge from '../components/UI/StageBadge'
import { SkeletonList } from '../components/UI/Skeleton'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ active: 0, thisMonth: 0, pendingFollowups: 0, pendingPayments: 0 })
  const [followups, setFollowups] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    const [ordersRes, followupRes, recentRes, pendingPayRes] = await Promise.all([
      supabase.from('sales_orders').select('id, current_stage, created_at', { count: 'exact' })
        .not('current_stage', 'in', '("completed","lost")'),
      supabase.from('sales_orders')
        .select('*, clients(company_name, contact_person)')
        .lte('next_followup_date', today)
        .not('current_stage', 'in', '("completed")')
        .not('followup_status', 'eq', 'Lost')
        .order('next_followup_date'),
      supabase.from('sales_orders')
        .select('*, clients(company_name)')
        .order('updated_at', { ascending: false })
        .limit(10),
      supabase.from('sales_orders').select('id', { count: 'exact' })
        .eq('payment_completed', false)
        .not('po_date', 'is', null)
    ])

    const thisMonthRes = await supabase.from('sales_orders').select('id', { count: 'exact' })
      .gte('created_at', monthStart)

    setStats({
      active: ordersRes.count || 0,
      thisMonth: thisMonthRes.count || 0,
      pendingFollowups: followupRes.data?.length || 0,
      pendingPayments: pendingPayRes.count || 0,
    })
    setFollowups(followupRes.data || [])
    setRecent(recentRes.data || [])
    setLoading(false)
  }

  const summaryCards = [
    { label: 'Active Orders', value: stats.active, icon: Package, color: 'bg-blue-500' },
    { label: 'This Month', value: stats.thisMonth, icon: CalendarClock, color: 'bg-purple-500' },
    { label: 'Pending Follow-ups', value: stats.pendingFollowups, icon: AlertTriangle, color: 'bg-amber-500' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, color: 'bg-red-500' },
  ]

  if (loading) return (
    <>
      <AppHeader title="Dashboard" />
      <SkeletonList count={6} />
    </>
  )

  return (
    <div className="pb-20">
      <AppHeader title="Dashboard" />

      {/* Summary Cards */}
      <div className="flex gap-3 px-4 pt-4 overflow-x-auto pb-2 snap-x">
        {summaryCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="flex-shrink-0 w-36 bg-white rounded-2xl p-4 shadow-sm snap-start">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mono">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 px-4 mt-4">
        <button onClick={() => navigate('/orders/new')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy text-white rounded-xl text-sm font-medium">
          <Plus size={18} /> New Inquiry
        </button>
        <button onClick={() => navigate('/followups')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium">
          <ListChecks size={18} /> Follow-ups
        </button>
      </div>

      {/* Pending Follow-ups */}
      {followups.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Pending Follow-ups</h2>
          <div className="flex flex-col gap-2">
            {followups.slice(0, 5).map(order => (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-xl p-3.5 shadow-sm text-left flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{order.clients?.company_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.product_name} &middot; {order.clients?.contact_person}</p>
                </div>
                {isOverdue(order.next_followup_date) ? (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold flex-shrink-0">OVERDUE</span>
                ) : isToday(order.next_followup_date) ? (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex-shrink-0">TODAY</span>
                ) : (
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDateShort(order.next_followup_date)}</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="mt-6 px-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h2>
        <div className="flex flex-col gap-2">
          {recent.map(order => (
            <button
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white rounded-xl p-3.5 shadow-sm text-left flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {order.order_number} &middot; {order.clients?.company_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{order.product_name}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <StageBadge stage={order.current_stage} />
                {daysSince(order.updated_at) !== null && (
                  <span className="text-[10px] text-gray-400">{daysSince(order.updated_at)}d ago</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
