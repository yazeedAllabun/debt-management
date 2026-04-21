import { useClients } from '../../hooks/useClients'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useTheme } from '../../context/ThemeContext'
import { StatsGrid } from './StatsGrid'
import { MonthlyChart } from './MonthlyChart'
import { RecentActivity } from './RecentActivity'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import logoImg from '../../assets/logo.jpg'

export function DashboardPage() {
  const { clients, loading, error } = useClients()
  const stats = useDashboardStats(clients)
  const { theme } = useTheme()

  if (loading) return <LoadingSpinner text="جاري تحميل البيانات..." />
  if (error) return (
    <div className="text-center py-20 text-red-500">
      خطأ في الاتصال بقاعدة البيانات: {error}
    </div>
  )

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: `url(${logoImg})`,
          backgroundSize: '50%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: theme === 'dark' ? 0.07 : 0.15,
          zIndex: 1,
        }}
      />
      <div className="relative space-y-6" style={{ zIndex: 2 }}>
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
    </>
  )
}
