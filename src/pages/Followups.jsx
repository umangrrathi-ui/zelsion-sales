import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/Layout/AppHeader'
import { SkeletonList } from '../components/UI/Skeleton'
import EmptyState from '../components/UI/EmptyState'
import { isOverdue, isToday, formatDate, formatDateShort } from '../lib/utils'
import { CalendarClock } from 'lucide-react'

export default function Followups() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowups()
  }, [])

  async function loadFollowups() {
    const { data } = await supabase
      .from('sales_orders')
      .select('*, clients(company_name, contact_person)')
      .not('current_stage', 'eq', 'completed')
      .not('followup_status', 'eq', 'Lost')
      .not('next_followup_date', 'is', null)
      .order('next_followup_date')
    setOrders(data || [])
    setLoading(false)
  }

  const overdue = orders.filter(o => isOverdue(o.next_followup_date))
  const today = orders.filter(o => isToday(o.next_followup_date))
  const future = orders.filter(o => !isOverdue(o.next_followup_date) && !isToday(o.next_followup_date))

  if (loading) return <><AppHeader title="Follow-ups" showBack /><SkeletonList count={6} /></>

  const renderGroup = (title, items, color) => {
    if (items.length === 0) return null
    return (
      <div className="mb-4">
        <h3 className={`text-sm font-semibold mb-2 ${color}`}>{title} ({items.length})</h3>
        <div className="flex flex-col gap-2">
          {items.map(order => (
            <button
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white rounded-xl p-3.5 shadow-sm text-left flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{order.clients?.company_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.order_number} &middot; {order.product_name}</p>
                {order.clients?.contact_person && <p className="text-xs text-gray-400 mt-0.5">{order.clients.contact_person}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-xs font-medium ${
                  isOverdue(order.next_followup_date) ? 'text-danger' :
                  isToday(order.next_followup_date) ? 'text-warning' : 'text-gray-500'
                }`}>
                  {formatDateShort(order.next_followup_date)}
                </span>
                {order.followup_status && (
                  <span className="text-[10px] text-gray-400">{order.followup_status}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <AppHeader title="Follow-ups" showBack />
      <div className="p-4">
        {orders.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No pending follow-ups" message="All caught up! No follow-ups scheduled." />
        ) : (
          <>
            {renderGroup('Overdue', overdue, 'text-danger')}
            {renderGroup("Today's Follow-ups", today, 'text-warning')}
            {renderGroup('Upcoming', future, 'text-gray-700')}
          </>
        )}
      </div>
    </div>
  )
}
