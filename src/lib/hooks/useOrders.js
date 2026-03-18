import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useOrders(filter) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('sales_orders')
      .select('*, clients(company_name, contact_person, city, phone)')
      .order('updated_at', { ascending: false })

    if (filter === 'active') {
      query = query.not('current_stage', 'in', '("completed","lost")')
    } else if (filter === 'completed') {
      query = query.eq('current_stage', 'completed')
    } else if (filter === 'lost') {
      query = query.eq('followup_status', 'Lost')
    }

    const { data, error } = await query
    if (!error) setOrders(data || [])
    setLoading(false)
    return { data, error }
  }, [filter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const createOrder = async (orderData) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('sales_orders')
      .insert({ ...orderData, created_by: user.id, updated_by: user.email })
      .select()
      .single()
    return { data, error }
  }

  const updateOrder = async (id, updates) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('sales_orders')
      .update({ ...updates, updated_at: new Date().toISOString(), updated_by: user?.email })
      .eq('id', id)
      .select('*, clients(company_name, contact_person, city, phone)')
      .single()
    return { data, error }
  }

  return { orders, loading, fetchOrders, createOrder, updateOrder }
}

export function useOrder(id) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*, clients(company_name, contact_person, city, phone, email, gst_number, state)')
      .eq('id', id)
      .single()
    if (!error) setOrder(data)
    setLoading(false)
    return { data, error }
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const updateOrder = async (updates) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('sales_orders')
      .update({ ...updates, updated_at: new Date().toISOString(), updated_by: user?.email })
      .eq('id', id)
      .select('*, clients(company_name, contact_person, city, phone, email, gst_number, state)')
      .single()
    if (!error) setOrder(data)
    return { data, error }
  }

  return { order, loading, fetchOrder, updateOrder }
}
