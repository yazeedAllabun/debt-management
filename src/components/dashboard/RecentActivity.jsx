import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate } from '../../utils/formatters'

export function RecentActivity({ clients }) {
  const recent = clients.slice(0, 8)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
          آخر العملاء المضافين
        </h3>
        <Link
          to="/clients"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          عرض الكل
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 py-8">لا يوجد عملاء بعد</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">الاسم</th>
                <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">البنك</th>
                <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">مبلغ الدين</th>
                <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">الحالة</th>
                <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {recent.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{c.name}</td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{c.bank_name || '—'}</td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{formatCurrency(c.debt_amount)}</td>
                  <td className="py-3"><Badge status={c.status} /></td>
                  <td className="py-3 text-gray-400 dark:text-gray-500 text-xs">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
