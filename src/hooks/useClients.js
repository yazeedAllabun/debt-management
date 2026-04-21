import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setClients(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const addClient = useCallback(async (clientData) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...clientData, updated_at: new Date().toISOString() }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    setClients(prev => [data, ...prev])
    return data
  }, [])

  const updateClientStatus = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setClients(prev => prev.map(c => c.id === id ? data : c))
  }, [])

  const deleteClient = useCallback(async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    setClients(prev => prev.filter(c => c.id !== id))
  }, [])

  return { clients, loading, error, addClient, updateClientStatus, deleteClient, refetch: fetchClients }
}
