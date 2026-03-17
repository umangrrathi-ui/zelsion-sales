import { useState } from 'react'
import { Upload } from 'lucide-react'
import { DOC_TYPES } from '../../lib/utils'

export default function FileUploader({ onUpload, loading }) {
  const [docType, setDocType] = useState('Other')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) onUpload(file, docType)
    e.target.value = ''
  }

  return (
    <div className="flex gap-2 items-end">
      <select value={docType} onChange={e => setDocType(e.target.value)}
        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white outline-none flex-shrink-0">
        {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
      </select>
      <label className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-navy/10 text-navy rounded-lg text-sm font-medium cursor-pointer">
        <Upload size={16} /> {loading ? 'Uploading...' : 'Upload'}
        <input type="file" accept=".pdf,image/jpeg,image/png" onChange={handleFile} className="hidden" disabled={loading} />
      </label>
    </div>
  )
}
