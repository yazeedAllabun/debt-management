import { useMemo } from 'react'
import { useClients } from '../../hooks/useClients'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { formatCurrency, formatNumber, calcProfit } from '../../utils/formatters'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ar } from 'date-fns/locale'
import { printReport } from '../../utils/printReport'
import { exportToExcel } from '../../utils/exportToExcel'
import { Printer, FileDown } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

function buildMonthlyReport(clients) {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const month = subMonths(now, 11 - i)
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const monthClients = clients.filter(c => {
      try { return isWithinInterval(new Date(c.created_at), { start, end }) }
      catch { return false }
    })
    const totalDebt = monthClients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0)
    const totalPaid = monthClients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0)
    const totalProfit = monthClients.reduce(
      (s, c) => s + calcProfit(c.debt_amount, c.commission_pct), 0
    )
    const paidCount = monthClients.filter(c => c.status === 'paid').length
    return {
      month: format(month, 'MMM yy', { locale: ar }),
      fullMonth: format(month, 'MMMM yyyy', { locale: ar }),
      totalClients: monthClients.length,
      paidCount,
      totalDebt,
      totalPaid,
      totalProfit,
    }
  })
}

export function ReportsPage() {
  const { clients, loading, error } = useClients()
  const monthlyData = useMemo(() => buildMonthlyReport(clients), [clients])

  const totals = useMemo(() => ({
    clients: clients.length,
    paid: clients.filter(c => c.status === 'paid').length,
    debt: clients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0),
    paidAmount: clients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0),
    profit: clients.reduce((s, c) => s + calcProfit(c.debt_amount, c.commission_pct), 0),
  }), [clients])

  if (loading) return <LoadingSpinner text="جاري تحميل التقارير..." />
  if (error) return <div className="text-center py-20 text-red-500">خطأ: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">التقارير</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ملخص الأداء السنوي الشهري</p>
        </div>
        <div className="no-print flex gap-3">
          <button
            onClick={() => exportToExcel(clients, 'تقرير-شامل')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            <FileDown size={16} />
            تصدير Excel
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <Printer size={16} />
            طباعة التقرير
          </button>
        </div>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي العملاء', value: formatNumber(totals.clients) },
          { label: 'المكتملة', value: formatNumber(totals.paid) },
          { label: 'إجمالي الديون', value: formatCurrency(totals.debt) },
          { label: 'صافي الأرباح', value: formatCurrency(totals.profit) },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
          الأداء الشهري (آخر 12 شهراً)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={65} />
            <Tooltip
              formatter={(v, name) => [v.toLocaleString('ar-SA'), name]}
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
            />
            <Legend />
            <Bar dataKey="totalDebt" name="إجمالي الديون" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalProfit" name="الأرباح" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">الجدول الشهري التفصيلي</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {['الشهر', 'عدد العملاء', 'المكتملة', 'إجمالي التسويات', 'الأرباح'].map(h => (
                  <th key={h} className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {monthlyData.map(row => (
                <tr key={row.fullMonth} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{row.fullMonth}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatNumber(row.totalClients)}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400">{formatNumber(row.paidCount)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(row.totalDebt)}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">{formatCurrency(row.totalProfit)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                <td className="px-4 py-3 text-blue-700 dark:text-blue-300">الإجمالي</td>
                <td className="px-4 py-3 text-blue-700 dark:text-blue-300">{formatNumber(totals.clients)}</td>
                <td className="px-4 py-3 text-blue-700 dark:text-blue-300">{formatNumber(totals.paid)}</td>
                <td className="px-4 py-3 text-blue-700 dark:text-blue-300">{formatCurrency(totals.debt)}</td>
                <td className="px-4 py-3 text-blue-700 dark:text-blue-300">{formatCurrency(totals.profit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
