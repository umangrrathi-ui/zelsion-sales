import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*, sales_orders(id, current_stage, updated_at)')
      .order('company_name')
    if (!error) setClients(data || [])
    setLoading(false)
    return { data, error }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const createClient = async (clientData) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...clientData, created_by: user.id })
      .select()
      .single()
    if (!error) await fetchClients()
    return { data, error }
  }

  const updateClient = async (id, updates) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetchClients()
    return { data, error }
  }

  return { clients, loading, fetchClients, createClient, updateClient }
}
