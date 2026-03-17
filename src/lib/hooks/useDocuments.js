import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useDocuments(salesOrderId) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    if (!salesOrderId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('sales_order_id', salesOrderId)
      .order('created_at', { ascending: false })
    if (!error) setDocuments(data || [])
    setLoading(false)
    return { data, error }
  }, [salesOrderId])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const uploadDocument = async (file, documentType) => {
    const { data: { user } } = await supabase.auth.getUser()
    const fileExt = file.name.split('.').pop()
    const filePath = `${salesOrderId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('zelsion-docs')
      .upload(filePath, file)
    if (uploadError) return { error: uploadError }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        sales_order_id: salesOrderId,
        document_type: documentType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        uploaded_by: user.id
      })
      .select()
      .single()
    if (!error) await fetchDocuments()
    return { data, error }
  }

  const getSignedUrl = async (filePath) => {
    const { data, error } = await supabase.storage
      .from('zelsion-docs')
      .createSignedUrl(filePath, 3600)
    return { url: data?.signedUrl, error }
  }

  const deleteDocument = async (doc) => {
    await supabase.storage.from('zelsion-docs').remove([doc.file_path])
    const { error } = await supabase.from('documents').delete().eq('id', doc.id)
    if (!error) await fetchDocuments()
    return { error }
  }

  return { documents, loading, uploadDocument, getSignedUrl, deleteDocument, fetchDocuments }
}
