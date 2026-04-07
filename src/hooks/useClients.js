import { useState, useCallback } from 'react'

const STORAGE_KEY = 'debt_clients'

function loadClients() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveClients(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}

export function useClients() {
  const [clients, setClients] = useState(() => loadClients())
  const [loading] = useState(false)
  const [error] = useState(null)

  const addClient = useCallback((clientData) => {
    const newClient = {
      ...clientData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setClients(prev => {
      const updated = [newClient, ...prev]
      saveClients(updated)
      return updated
    })
    return newClient
  }, [])

  const updateClientStatus = useCallback((id, status) => {
    setClients(prev => {
      const updated = prev.map(c =>
        c.id === id ? { ...c, status, updated_at: new Date().toISOString() } : c
      )
      saveClients(updated)
      return updated
    })
  }, [])

  const deleteClient = useCallback((id) => {
    setClients(prev => {
      const updated = prev.filter(c => c.id !== id)
      saveClients(updated)
      return updated
    })
  }, [])

  const refetch = useCallback(() => {
    setClients(loadClients())
  }, [])

  return { clients, loading, error, addClient, updateClientStatus, deleteClient, refetch }
}
