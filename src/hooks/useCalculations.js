import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCalculations() {
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchCalculations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setCalculations(data || [])
    setLoading(false)
  }

  async function saveCalculation(calcData) {
    const { data, error } = await supabase
      .from('calculations')
      .insert([calcData])
      .select()
      .single()
    if (error) throw error
    setCalculations(prev => [data, ...prev])
    return data
  }

  async function deleteCalculation(id) {
    const { error } = await supabase.from('calculations').delete().eq('id', id)
    if (error) throw error
    setCalculations(prev => prev.filter(c => c.id !== id))
  }

  useEffect(() => { fetchCalculations() }, [])

  return { calculations, loading, error, saveCalculation, deleteCalculation, refetch: fetchCalculations }
}
