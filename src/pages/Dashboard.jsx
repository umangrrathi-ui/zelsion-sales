import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, CalendarClock, AlertTriangle, CreditCard, Plus, ListChecks, ChevronRight, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { daysSince, isOverdue, isToday, formatDateShort, getStageInfo, STAGES } from '../lib/utils'
import { getProductNames } from '../lib/products'
import AppHeader from '../components/Layout/AppHeader'
import StageBadge from '../components/UI/StageBadge'
import { SkeletonList } from '../components/UI/Skeleton'

const stageColorMap = {
  'stage-inquiry': 'bg-blue-500',
  'stage-quotation': 'bg-purple-500',
  'stage-followup': 'bg-orange-500',
  'stage-po': 'bg-cyan-500',
  'stage-payment-terms': 'bg-yellow-500',
  'stage-advance': 'bg-lime-500',
  'stage-dispatch': 'bg-indigo-500',
  'stage-invoice': 'bg-pink-500',
  'stage-delivery': 'bg-teal-500',
  'stage-complete': 'bg-green-500',
}

const stageBgMap = {
  'stage-inquiry': 'bg-blue-50 border-blue-200',
  'stage-quotation': 'bg-purple-50 border-purple-200',
  'stage-followup': 'bg-orange-50 border-orange-200',
  'stage-po': 'bg-cyan-50 border-cyan-200',
  'stage-payment-terms': 'bg-yellow-50 border-yellow-200',
  'stage-advance': 'bg-lime-50 border-lime-200',
  'stage-dispatch': 'bg-indigo-50 border-indigo-200',
  'stage-invoice': 'bg-pink-50 border-pink-200',
  'stage-delivery': 'bg-teal-50 border-teal-200',
  'stage-complete': 'bg-green-50 border-green-200',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ active: 0, thisMonth: 0, pendingFollowups: 0, pendingPayments: 0 })
  const [followups, setFollowups] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedStages, setExpandedStages] = useState({})
  const [activeTab, setActiveTab] = useState('pipeline') // 'pipeline' or 'activity'

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    const [ordersRes, followupRes, allOrdersRes, pendingPayRes, thisMonthRes] = await Promise.all([
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
        .order('updated_at', { ascending: false }),
      supabase.from('sales_orders').select('id', { count: 'exact' })
        .eq('payment_completed', false)
        .not('po_date', 'is', null),
      supabase.from('sales_orders').select('id', { count: 'exact' })
        .gte('created_at', monthStart),
    ])

    setStats({
      active: ordersRes.count || 0,
      thisMonth: thisMonthRes.count || 0,
      pendingFollowups: followupRes.data?.length || 0,
      pendingPayments: pendingPayRes.count || 0,
    })
    setFollowups(followupRes.data || [])
    setAllOrders(allOrdersRes.data || [])

    // Auto-expand stages that have orders (except completed)
    const expanded = {}
    STAGES.forEach(s => {
      const count = (allOrdersRes.data || []).filter(o => o.current_stage === s.key).length
      if (count > 0 && s.key !== 'completed') expanded[s.key] = true
    })
    setExpandedStages(expanded)

    setLoading(false)
  }

  // Group orders by stage
  const ordersByStage = {}
  STAGES.forEach(s => {
    ordersByStage[s.key] = allOrders.filter(o => o.current_stage === s.key)
  })

  const toggleStage = (key) => {
    setExpandedStages(prev => ({ ...prev, [key]: !prev[key] }))
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

      {/* Tab Switcher */}
      <div className="flex gap-1 mx-4 mt-5 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${activeTab === 'pipeline' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}
        >
          Pipeline View
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${activeTab === 'activity' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}
        >
          Recent Activity
        </button>
      </div>

      {activeTab === 'pipeline' ? (
        /* Pipeline View - All Orders by Stage */
        <section className="mt-4 px-4">
          {/* Pipeline summary bar */}
          <div className="flex gap-0.5 mb-4 h-3 rounded-full overflow-hidden bg-gray-100">
            {STAGES.map(stage => {
              const count = ordersByStage[stage.key]?.length || 0
              if (count === 0) return null
              const pct = (count / allOrders.length) * 100
              return (
                <div
                  key={stage.key}
                  className={`${stageColorMap[stage.color]} transition-all`}
                  style={{ width: `${Math.max(pct, 3)}%` }}
                  title={`${stage.label}: ${count}`}
                />
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            {STAGES.map(stage => {
              const orders = ordersByStage[stage.key] || []
              const isExpanded = expandedStages[stage.key]
              const bgClass = stageBgMap[stage.color] || 'bg-gray-50 border-gray-200'
              const dotColor = stageColorMap[stage.color] || 'bg-gray-500'

              return (
                <div key={stage.key} className={`rounded-xl border overflow-hidden ${orders.length > 0 ? bgClass : 'bg-gray-50/50 border-gray-100'}`}>
                  <button
                    onClick={() => orders.length > 0 && toggleStage(stage.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${orders.length > 0 ? dotColor : 'bg-gray-300'}`} />
                    <span className="text-sm">{stage.icon}</span>
                    <span className={`text-sm font-medium flex-1 ${orders.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                      {stage.label}
                    </span>
                    <span className={`text-sm font-bold mono ${orders.length > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                      {orders.length}
                    </span>
                    {orders.length > 0 && (
                      isExpanded
                        ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                        : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && orders.length > 0 && (
                    <div className="px-3 pb-3">
                      <div className="flex flex-col gap-1.5">
                        {orders.map(order => (
                          <button
                            key={order.id}
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="bg-white rounded-lg p-3 text-left flex items-center gap-3 shadow-sm active:bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {order.order_number} &middot; {order.clients?.company_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {getProductNames(order.product_name)}
                                {order.quantity_kg ? ` · ${order.quantity_kg} kg` : ''}
                              </p>
                            </div>
                            {daysSince(order.updated_at) !== null && (
                              <span className="text-[10px] text-gray-400 flex-shrink-0">{daysSince(order.updated_at)}d ago</span>
                            )}
                            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        /* Recent Activity + Follow-ups */
        <>
          {/* Pending Follow-ups */}
          {followups.length > 0 && (
            <section className="mt-4 px-4">
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
                      <p className="text-xs text-gray-500 mt-0.5">{getProductNames(order.product_name)} &middot; {order.clients?.contact_person}</p>
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
          <section className="mt-4 px-4">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h2>
            <div className="flex flex-col gap-2">
              {allOrders.slice(0, 15).map(order => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-white rounded-xl p-3.5 shadow-sm text-left flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {order.order_number} &middot; {order.clients?.company_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{getProductNames(order.product_name)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StageBadge stage={order.current_stage} />
                    {daysSince(order.updated_at) !== null && (
                      <span className="text-[10px] text-gray-400">{daysSince(order.updated_at)}d ago</span>
                    )}
                  </div>
                </button>
              ))}
              {allOrders.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No orders yet. Create your first inquiry!</div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
