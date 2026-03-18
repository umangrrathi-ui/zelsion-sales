import { useNavigate } from 'react-router-dom'
import { daysSince } from '../../lib/utils'
import { getProductNames } from '../../lib/products'
import StageBadge from '../UI/StageBadge'

export default function OrderCard({ order }) {
  const navigate = useNavigate()
  const days = daysSince(order.updated_at)

  return (
    <button
      onClick={() => navigate(`/orders/${order.id}`)}
      className="bg-white rounded-xl p-4 shadow-sm text-left w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[15px] text-gray-900 mono truncate">{order.order_number}</p>
          <p className="text-sm text-gray-600 mt-0.5 truncate">{order.clients?.company_name}</p>
        </div>
        <StageBadge stage={order.current_stage} />
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span className="truncate">{getProductNames(order.product_name)}</span>
        {order.quantity_kg && <span>&middot; {order.quantity_kg} kg</span>}
        {days !== null && <span className="ml-auto">{days}d ago</span>}
      </div>
    </button>
  )
}
