import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useClients } from '../../hooks/useClients'
import { ClientsTable } from './ClientsTable'
import { ClientsToolbar } from './ClientsToolbar'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export function ClientsPage() {
  const { clients, loading, error, deleteClient } = useClients()
  const navigate = useNavigate()
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">العملاء</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إجمالي {clients.length} عميل</p>
        </div>
        <button
          onClick={() => navigate('/add-client')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <UserPlus size={16} />
          إضافة عميل
        </button>
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
