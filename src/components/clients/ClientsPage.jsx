import { useState } from 'react'
import { useClients } from '../../hooks/useClients'
import { ClientsTable } from './ClientsTable'
import { ClientsToolbar } from './ClientsToolbar'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export function ClientsPage() {
  const { clients, loading, error, deleteClient } = useClients()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = clients.filter(c => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search)
    const matchStatus = statusFilter === 'all' || c.payment_status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSpinner text="جاري تحميل العملاء..." />
  if (error) return <div className="text-center py-20 text-red-500">خطأ: {error}</div>

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">العملاء</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          إجمالي {clients.length} عميل
        </p>
      </div>

      <ClientsToolbar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        clients={filtered}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <ClientsTable clients={filtered} onDelete={deleteClient} />
      </div>
    </div>
  )
}
