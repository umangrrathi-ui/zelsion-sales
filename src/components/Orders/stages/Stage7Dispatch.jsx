import { useState } from 'react'
import { formatDate } from '../../../lib/utils'
import { Upload, FileText, CheckCircle2 } from 'lucide-react'

export default function Stage7Dispatch({ order, onSave, onUpload, expanded, loading }) {
  const [form, setForm] = useState({
    batch_number: order.batch_number || '',
    expected_dispatch_date: order.expected_dispatch_date || '',
    actual_dispatch_date: order.actual_dispatch_date || '',
    transport_company: order.transport_company || '',
    lr_number: order.lr_number || '',
  })
  const [uploadingInvoice, setUploadingInvoice] = useState(false)
  const [uploadingEway, setUploadingEway] = useState(false)
  const [invoiceUploaded, setInvoiceUploaded] = useState(false)
  const [ewayUploaded, setEwayUploaded] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleFileUpload = async (file, docType) => {
    if (docType === 'Tax_Invoice') {
      setUploadingInvoice(true)
      await onUpload(file, docType)
      setUploadingInvoice(false)
      setInvoiceUploaded(true)
    } else {
      setUploadingEway(true)
      await onUpload(file, docType)
      setUploadingEway(false)
      setEwayUploaded(true)
    }
  }

  if (!expanded) {
    return (
      <div className="text-sm text-gray-600">
        <p>Batch: {order.batch_number} &middot; LR: {order.lr_number}</p>
        <p className="text-xs text-gray-400 mt-0.5">Dispatched: {formatDate(order.actual_dispatch_date)} &middot; {order.transport_company}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Batch Number</label>
        <input value={form.batch_number} onChange={e => set('batch_number', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Expected Dispatch</label>
          <input type="date" value={form.expected_dispatch_date} onChange={e => set('expected_dispatch_date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Actual Dispatch</label>
          <input type="date" value={form.actual_dispatch_date} onChange={e => set('actual_dispatch_date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Transport Company</label>
        <input value={form.transport_company} onChange={e => set('transport_company', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">LR Number (Lorry Receipt)</label>
        <input value={form.lr_number} onChange={e => set('lr_number', e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-navy mono" />
      </div>

      {/* Invoice Upload */}
      <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-gray-50/50">
        <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <FileText size={14} className="text-navy" /> Upload Invoice (PDF/Image)
        </label>
        {invoiceUploaded ? (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle2 size={16} /> Invoice uploaded successfully
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0], 'Tax_Invoice')}
              disabled={uploadingInvoice}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
              {uploadingInvoice ? (
                <span className="text-navy font-medium">Uploading...</span>
              ) : (
                <>
                  <Upload size={16} className="text-navy" />
                  <span>Tap to upload invoice</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* E-way Bill Upload */}
      <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-gray-50/50">
        <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <FileText size={14} className="text-navy" /> Upload E-way Bill (PDF/Image)
        </label>
        {ewayUploaded ? (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle2 size={16} /> E-way bill uploaded successfully
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0], 'Eway_Bill')}
              disabled={uploadingEway}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
              {uploadingEway ? (
                <span className="text-navy font-medium">Uploading...</span>
              ) : (
                <>
                  <Upload size={16} className="text-navy" />
                  <span>Tap to upload e-way bill</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => onSave({ ...form, current_stage: 'invoice' })} disabled={loading}
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50 mt-1">
        {loading ? 'Saving...' : 'Save & Generate Invoice'}
      </button>
      <button onClick={() => onSave(form)} disabled={loading}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50">
        Save Draft
      </button>
    </div>
  )
}
