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
    <div
      className="space-y-6 relative min-h-screen"
      style={{
        backgroundImage: `url(${logoImg})`,
        backgroundSize: '45%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: theme === 'dark' ? 'rgba(17,24,39,0.88)' : 'rgba(255,255,255,0.82)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 space-y-6">
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
    </div>
  )
}
