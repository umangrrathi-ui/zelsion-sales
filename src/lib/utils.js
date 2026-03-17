export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '---'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function daysSince(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24))
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d < today
}

export function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function calculateGST(taxableAmount, isInterstate = false) {
  const gstRate = 0.18
  const gstAmount = taxableAmount * gstRate
  if (isInterstate) {
    return { igst: gstAmount, cgst: 0, sgst: 0, total: taxableAmount + gstAmount }
  }
  return { igst: 0, cgst: gstAmount / 2, sgst: gstAmount / 2, total: taxableAmount + gstAmount }
}

export async function generateOrderNumber(supabase) {
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .ilike('order_number', `ZEL-${year}-%`)
  const next = (count || 0) + 1
  return `ZEL-${year}-${String(next).padStart(3, '0')}`
}

export const STAGES = [
  { key: 'inquiry', label: 'Inquiry Received', icon: '📥', color: 'stage-inquiry' },
  { key: 'quotation', label: 'Quotation Shared', icon: '💬', color: 'stage-quotation' },
  { key: 'followup', label: 'Follow-up', icon: '🔄', color: 'stage-followup' },
  { key: 'po_received', label: 'PO Received', icon: '📋', color: 'stage-po' },
  { key: 'payment_terms', label: 'Payment Terms', icon: '💰', color: 'stage-payment-terms' },
  { key: 'advance_payment', label: 'Advance Received', icon: '💵', color: 'stage-advance' },
  { key: 'dispatch', label: 'Production & Dispatch', icon: '🏭', color: 'stage-dispatch' },
  { key: 'invoice', label: 'Invoice Generated', icon: '📄', color: 'stage-invoice' },
  { key: 'delivery', label: 'Delivery Confirmed', icon: '🚚', color: 'stage-delivery' },
  { key: 'completed', label: 'Payment Completed', icon: '💳', color: 'stage-complete' }
]

export function getStageIndex(stageKey) {
  return STAGES.findIndex(s => s.key === stageKey)
}

export function getStageInfo(stageKey) {
  return STAGES.find(s => s.key === stageKey) || STAGES[0]
}

export const PRODUCTS = ['MCC PH 101', 'MCC PH 102', 'MCC PH 200', 'Multiple']
export const INQUIRY_SOURCES = ['WhatsApp', 'Email', 'Reference', 'Exhibition', 'Cold Call', 'CPHI']
export const FOLLOWUP_MODES = ['Call', 'WhatsApp', 'Email', 'Visit', 'Meeting']
export const FOLLOWUP_STATUSES = ['Hot', 'Warm', 'Cold', 'Converted', 'Lost']
export const PAYMENT_TYPES = ['100% Advance', 'Part Advance + Credit', 'Full Credit']
export const CREDIT_DAYS_OPTIONS = [0, 30, 45, 60, 90]
export const PAYMENT_MODES = ['NEFT', 'RTGS', 'Cheque', 'UPI']
export const DOC_TYPES = ['PO', 'Quotation', 'COA', 'Tax_Invoice', 'Eway_Bill', 'Advance_Receipt', 'Other']

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
]
