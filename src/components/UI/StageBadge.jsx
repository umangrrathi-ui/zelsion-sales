import { getStageInfo } from '../../lib/utils'

const colorMap = {
  'stage-inquiry': 'bg-blue-100 text-blue-700',
  'stage-quotation': 'bg-purple-100 text-purple-700',
  'stage-followup': 'bg-orange-100 text-orange-700',
  'stage-po': 'bg-cyan-100 text-cyan-700',
  'stage-payment-terms': 'bg-yellow-100 text-yellow-800',
  'stage-advance': 'bg-lime-100 text-lime-700',
  'stage-dispatch': 'bg-indigo-100 text-indigo-700',
  'stage-invoice': 'bg-pink-100 text-pink-700',
  'stage-delivery': 'bg-teal-100 text-teal-700',
  'stage-complete': 'bg-green-100 text-green-700',
}

export default function StageBadge({ stage, className = '' }) {
  const info = getStageInfo(stage)
  const colors = colorMap[info.color] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colors} ${className}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}
