import { Trash2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate, calcProfit } from '../../utils/formatters'

export function ClientsTable({ clients, onDelete }) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        لا يوجد عملاء مطابقون للبحث
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            {['الاسم', 'رقم الجوال', 'البنك', 'مبلغ التسوية', 'الربح', 'إجراءات السداد', 'إجراءات التمويل', 'تاريخ الإضافة', ''].map(h => (
              <th key={h} className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {clients.map(c => (
            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{c.name}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.phone || '—'}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {Array.isArray(c.bank_names) && c.bank_names.length > 0
                  ? c.bank_names.join('، ')
                  : c.bank_name || '—'}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{formatCurrency(c.debt_amount)}</td>
              <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                {formatCurrency(calcProfit(c.debt_amount, c.commission_pct))}
              </td>
              <td className="px-4 py-3"><Badge status={c.payment_status} type="payment" /></td>
              <td className="px-4 py-3"><Badge status={c.financing_status} type="financing" /></td>
              <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(c.created_at)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => {
                    if (window.confirm(`هل تريد حذف العميل "${c.name}"؟`)) {
                      onDelete(c.id)
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="حذف العميل"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
