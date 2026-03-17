import { useState } from 'react'
import { FileText, Download, Trash2, Image, File } from 'lucide-react'
import { useDocuments } from '../../lib/hooks/useDocuments'
import FileUploader from './FileUploader'
import { useToast } from '../UI/Toast'
import { formatDate } from '../../lib/utils'

const docIcons = {
  PO: '📋', Quotation: '💬', COA: '🧪', Tax_Invoice: '🧾', Eway_Bill: '🚛', Advance_Receipt: '💵', Other: '📑'
}

export default function DocumentVault({ salesOrderId }) {
  const { documents, loading, uploadDocument, getSignedUrl, deleteDocument } = useDocuments(salesOrderId)
  const toast = useToast()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file, type) => {
    setUploading(true)
    const { error } = await uploadDocument(file, type)
    if (error) toast.error('Upload failed: ' + error.message)
    else toast.success('Document uploaded!')
    setUploading(false)
  }

  const handleDownload = async (doc) => {
    const { url, error } = await getSignedUrl(doc.file_path)
    if (url) window.open(url, '_blank')
    else toast.error('Failed to get download link')
  }

  const handleDelete = async (doc) => {
    if (!confirm('Delete this document?')) return
    const { error } = await deleteDocument(doc)
    if (error) toast.error('Delete failed')
    else toast.success('Document deleted')
  }

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 mb-3">Document Vault</h3>
      <FileUploader onUpload={handleUpload} loading={uploading} />
      <div className="grid grid-cols-1 gap-2 mt-3">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">{docIcons[doc.document_type] || '📄'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
              <p className="text-xs text-gray-400">{doc.document_type.replace('_', ' ')} &middot; {formatSize(doc.file_size)} &middot; {formatDate(doc.created_at)}</p>
            </div>
            <button onClick={() => handleDownload(doc)} className="p-2 text-navy hover:bg-navy/10 rounded-lg">
              <Download size={18} />
            </button>
            <button onClick={() => handleDelete(doc)} className="p-2 text-danger hover:bg-red-50 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {documents.length === 0 && !loading && (
          <p className="text-center text-sm text-gray-400 py-4">No documents uploaded yet</p>
        )}
      </div>
    </div>
  )
}
