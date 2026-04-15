import { Users, CheckCircle, Clock, TrendingUp, Banknote, CreditCard } from 'lucide-react'
import { StatCard } from '../ui/StatCard'
import { formatCurrency, formatNumber } from '../../utils/formatters'

export function StatsGrid({ stats }) {
  const cards = [
    {
      title: 'إجمالي العملاء',
      value: formatNumber(stats.totalClients),
      subtitle: `هذا الشهر: ${formatNumber(stats.thisMonthClients)} عميل`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'إجراءات السداد',
      value: formatNumber(stats.paymentDone),
      subtitle: `معلق: ${formatNumber(stats.paymentPending)}`,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'إجراءات التمويل',
      value: formatNumber(stats.financingDone),
      subtitle: `معلق لدى البنك: ${formatNumber(stats.financingPending)}`,
      icon: CreditCard,
      color: 'purple',
    },
    {
      title: 'الحالات المعلقة',
      value: formatNumber(stats.pendingCases),
      subtitle: 'تحتاج متابعة',
      icon: Clock,
      color: 'yellow',
    },
    {
      title: 'إجمالي السداد',
      value: formatCurrency(stats.totalPaid),
      subtitle: `من إجمالي ديون: ${formatCurrency(stats.totalDebt)}`,
      icon: Banknote,
      color: 'blue',
    },
    {
      title: 'إجمالي الأرباح',
      value: formatCurrency(stats.totalProfit),
      subtitle: 'صافي الأرباح من العمولات',
      icon: TrendingUp,
      color: 'green',
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
