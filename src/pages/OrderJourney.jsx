import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, Share2 } from 'lucide-react'
import AppHeader from '../components/Layout/AppHeader'
import StageStepper from '../components/Orders/StageStepper'
import DocumentVault from '../components/Documents/DocumentVault'
import { SkeletonList } from '../components/UI/Skeleton'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import { useToast } from '../components/UI/Toast'
import { useOrder } from '../lib/hooks/useOrders'
import { useDocuments } from '../lib/hooks/useDocuments'
import { STAGES, getStageIndex, formatCurrency, formatDate } from '../lib/utils'

import Stage1Inquiry from '../components/Orders/stages/Stage1Inquiry'
import Stage2Quotation from '../components/Orders/stages/Stage2Quotation'
import Stage3Followup from '../components/Orders/stages/Stage3Followup'
import Stage4PO from '../components/Orders/stages/Stage4PO'
import Stage5PaymentTerms from '../components/Orders/stages/Stage5PaymentTerms'
import Stage6Advance from '../components/Orders/stages/Stage6Advance'
import Stage7Dispatch from '../components/Orders/stages/Stage7Dispatch'
import Stage8Invoice from '../components/Orders/stages/Stage8Invoice'
import Stage9Delivery from '../components/Orders/stages/Stage9Delivery'
import Stage10Payment from '../components/Orders/stages/Stage10Payment'

const stageComponents = [
  Stage1Inquiry, Stage2Quotation, Stage3Followup, Stage4PO,
  Stage5PaymentTerms, Stage6Advance, Stage7Dispatch, Stage8Invoice,
  Stage9Delivery, Stage10Payment
]

export default function OrderJourney() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { order, loading, updateOrder } = useOrder(id)
  const { uploadDocument } = useDocuments(id)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)

  if (loading) return <><AppHeader title="Order" showBack /><SkeletonList count={5} /></>
  if (!order) return <><AppHeader title="Order" showBack /><p className="p-4 text-center text-gray-500">Order not found</p></>

  const currentIdx = getStageIndex(order.current_stage)

  const handleSave = async (updates) => {
    const isStageChange = updates.current_stage && updates.current_stage !== order.current_stage
    if (isStageChange) {
      setConfirm({
        title: 'Move to Next Stage?',
        message: `This will advance the order to "${STAGES.find(s => s.key === updates.current_stage)?.label}". Continue?`,
        onConfirm: async () => {
          setConfirm(null)
          await doSave(updates)
        }
      })
    } else {
      await doSave(updates)
    }
  }

  const doSave = async (updates) => {
    setSaving(true)
    const { error } = await updateOrder(updates)
    if (error) toast.error(error.message)
    else toast.success('Saved successfully!')
    setSaving(false)
  }

  const handleUpload = async (file, type) => {
    const { error } = await uploadDocument(file, type)
    if (error) toast.error('Upload failed: ' + error.message)
    else toast.success('Document uploaded!')
  }

  const shareWhatsApp = () => {
    const text = `Order ${order.order_number}\nClient: ${order.clients?.company_name}\nProduct: ${order.product_name}\nStage: ${STAGES[currentIdx]?.label}\n${order.po_amount ? `PO Amount: ${formatCurrency(order.po_amount)}` : ''}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Check if Stage 6 should be skipped (no advance needed)
  const shouldSkipAdvance = order.payment_terms === 'Full Credit' || (order.advance_percentage === 0 && order.payment_terms)

  return (
    <div className="pb-20">
      <AppHeader title={order.order_number || 'Order'} showBack />

      {/* Client Summary */}
      <div className="mx-4 mt-3 bg-white rounded-xl p-3.5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-gray-900">{order.clients?.company_name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{order.clients?.contact_person} &middot; {order.clients?.city}</p>
            {order.updated_by && (
              <p className="text-[10px] text-gray-400 mt-1">Last updated by <span className="font-medium">{order.updated_by.split('@')[0]}</span></p>
            )}
          </div>
          <div className="flex gap-2">
            {order.clients?.phone && (
              <a href={`https://wa.me/91${order.clients.phone.replace(/\D/g, '').slice(-10)}`} target="_blank"
                className="p-2 bg-green-50 text-green-600 rounded-lg"><MessageCircle size={18} /></a>
            )}
            <button onClick={shareWhatsApp} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Share2 size={18} /></button>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="bg-white mx-4 mt-3 rounded-xl shadow-sm">
        <StageStepper currentStage={order.current_stage} />
      </div>

      {/* Stages Timeline */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {STAGES.map((stage, i) => {
          // Skip Stage 6 if no advance needed
          if (i === 5 && shouldSkipAdvance) return null

          const isCompleted = i < currentIdx
          const isCurrent = i === currentIdx
          const isFuture = i > currentIdx
          const StageComp = stageComponents[i]

          // Allow follow-up access even after that stage
          const isFollowupStage = i === 2
          const showFollowup = isFollowupStage && (isCurrent || isCompleted)

          return (
            <div key={stage.key} className={`rounded-xl overflow-hidden ${isFuture ? 'opacity-40' : ''}`}>
              <div className={`flex items-center gap-3 p-3 ${
                isCompleted ? 'bg-green-50' : isCurrent ? 'bg-navy/5' : 'bg-gray-50'
              }`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : stage.icon}
                </span>
                <span className={`text-sm font-semibold ${isCompleted ? 'text-success' : isCurrent ? 'text-navy' : 'text-gray-400'}`}>
                  {stage.label}
                </span>
              </div>
              {(isCurrent || isCompleted || (isFollowupStage && showFollowup)) && (
                <div className="bg-white p-3.5 border-x border-b border-gray-100 rounded-b-xl">
                  <StageComp
                    order={order}
                    onSave={handleSave}
                    onUpload={handleUpload}
                    expanded={isCurrent || (isFollowupStage && showFollowup)}
                    loading={saving}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Document Vault */}
      <div className="px-4">
        <DocumentVault salesOrderId={id} />
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
