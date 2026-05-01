import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setEmployees(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const addEmployee = useCallback(async (empData) => {
    const { data, error } = await supabase
      .from('employees')
      .insert([empData])
      .select()
      .single()
    if (error) throw new Error(error.message)
    setEmployees(prev => [data, ...prev])
    return data
  }, [])

  const deleteEmployee = useCallback(async (id) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    setEmployees(prev => prev.filter(e => e.id !== id))
  }, [])

  const updateEmployee = useCallback(async (id, fields) => {
    const { data, error } = await supabase
      .from('employees')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setEmployees(prev => prev.map(e => e.id === id ? data : e))
    return data
  }, [])

  const updateEmployeePassword = useCallback(async (id, encodedPassword) => {
    const { data, error } = await supabase
      .from('employees')
      .update({ password: encodedPassword })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setEmployees(prev => prev.map(e => e.id === id ? data : e))
    return data
  }, [])

  return { employees, loading, error, addEmployee, deleteEmployee, updateEmployee, updateEmployeePassword, refetch: fetchEmployees }
}
