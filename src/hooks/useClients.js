import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchClients()

    const channel = supabase
      .channel('clients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchClients()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchClients])

  const addClient = async (clientData) => {
    const { data, error: err } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single()

    if (err) throw new Error(err.message)
    return data
  }

  const updateClientStatus = async (id, status) => {
    const { error: err } = await supabase
      .from('clients')
      .update({ status })
      .eq('id', id)

    if (err) throw new Error(err.message)
  }

  return { clients, loading, error, addClient, updateClientStatus, refetch: fetchClients }
}
