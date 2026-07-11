import { Search, FileDown, Printer } from 'lucide-react'
import { exportToExcel } from '../../utils/exportToExcel'
import { printReport } from '../../utils/printReport'
import { usePermissions } from '../../hooks/usePermissions'

export function ClientsToolbar({ search, onSearch, statusFilter, onStatusFilter, clients }) {
  const { can } = usePermissions()
  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
        <input
          type="text"
          placeholder="بحث بالاسم أو رقم الجوال..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={e => onStatusFilter(e.target.value)}
        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        <option value="all">الكل</option>
        <option value="paid">مكتمل</option>
        <option value="pending">معلق</option>
      </select>

      {/* Export Excel */}
      {can('export_excel') && (
        <button
          onClick={() => exportToExcel(clients)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
        >
          <FileDown size={16} />
          تصدير Excel
        </button>
      )}

      {/* Print */}
      <button
        onClick={printReport}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
      >
        <Printer size={16} />
        طباعة
      </button>
    </div>
  )
}
