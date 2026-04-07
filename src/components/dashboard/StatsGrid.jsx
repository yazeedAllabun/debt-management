import { Users, CheckCircle, Clock, TrendingUp, Banknote, CalendarDays } from 'lucide-react'
import { StatCard } from '../ui/StatCard'
import { formatCurrency, formatNumber } from '../../utils/formatters'

export function StatsGrid({ stats }) {
  const cards = [
    {
      title: 'إجمالي العملاء',
      value: formatNumber(stats.totalClients),
      subtitle: `${formatNumber(stats.paidClientsCount)} مكتمل • ${formatNumber(stats.pendingClientsCount)} معلق`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'العملاء المسددون',
      value: formatNumber(stats.paidClientsCount),
      subtitle: 'إجمالي الحالات المكتملة',
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'الحالات المعلقة',
      value: formatNumber(stats.pendingClientsCount),
      subtitle: 'قيد المعالجة',
      icon: Clock,
      color: 'yellow',
    },
    {
      title: 'إجمالي الديون',
      value: formatCurrency(stats.totalDebt),
      subtitle: `مدفوع: ${formatCurrency(stats.totalPaid)}`,
      icon: Banknote,
      color: 'purple',
    },
    {
      title: 'إجمالي الأرباح',
      value: formatCurrency(stats.totalProfit),
      subtitle: 'صافي الأرباح من العمولات',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'إنتاجية هذا الشهر',
      value: formatNumber(stats.thisMonthClients),
      subtitle: `${formatCurrency(stats.thisMonthDebt)} إجمالي`,
      icon: CalendarDays,
      color: 'blue',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map(card => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}
