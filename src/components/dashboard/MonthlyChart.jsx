import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns'
import { ar } from 'date-fns/locale'

function buildMonthlyData(clients) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, 5 - i)
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const monthClients = clients.filter(c => {
      try { return isWithinInterval(new Date(c.created_at), { start, end }) }
      catch { return false }
    })
    const totalDebt = monthClients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0)
    const paidCount = monthClients.filter(c => c.status === 'paid').length
    return {
      month: format(month, 'MMM', { locale: ar }),
      'إجمالي الديون': Math.round(totalDebt),
      'المكتملة': paidCount,
    }
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {p.value.toLocaleString('ar-SA')}
        </p>
      ))}
    </div>
  )
}

export function MonthlyChart({ clients }) {
  const data = buildMonthlyData(clients)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
        الأداء الشهري (آخر 6 أشهر)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="إجمالي الديون" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
