import { useClients } from '../../hooks/useClients'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { usePermissions } from '../../hooks/usePermissions'
import { StatsGrid } from './StatsGrid'
import { MonthlyChart } from './MonthlyChart'
import { RecentActivity } from './RecentActivity'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Lock } from 'lucide-react'

export function DashboardPage() {
  const { can } = usePermissions()
  const { clients, loading, error } = useClients()
  const stats = useDashboardStats(clients)

  if (loading) return <LoadingSpinner text="جاري تحميل البيانات..." />
  if (error) return (
    <div className="text-center py-20 text-red-500">
      خطأ في الاتصال بقاعدة البيانات: {error}
    </div>
  )
  if (!can('view_dashboard')) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Lock size={40} className="text-gray-300 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400">ليس لديك صلاحية لعرض لوحة التحكم</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">لوحة التحكم</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">نظرة عامة على أداء الشركة</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyChart clients={clients} />
        <RecentActivity clients={clients} />
      </div>
    </div>
  )
}
