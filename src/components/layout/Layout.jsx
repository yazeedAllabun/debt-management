import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Calculator } from 'lucide-react'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { useEmployeeSession } from '../../context/EmployeeSessionContext'
import { EmployeeLogin } from '../auth/EmployeeLogin'
import { runTour, forceTour } from '../onboarding/OnboardingTour'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isMuhtasibPage = location.pathname === '/muhtasib'
  const { isOwner } = useOwnerSession()
  const { currentEmployee } = useEmployeeSession()

  const isLoggedIn = isOwner || !!currentEmployee

  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => runTour(() => setSidebarOpen(true)), 800)
    }
  }, [isLoggedIn])

  if (!isOwner && !currentEmployee && location.pathname !== '/owner') {
    return <EmployeeLogin />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onMenuClick={() => setSidebarOpen(o => !o)} onTour={() => forceTour(() => setSidebarOpen(true))} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="md:mr-64 pt-16 min-h-screen">
        <div className="p-4 md:p-6 print-full">
          <Outlet />
        </div>
      </main>

      <footer className="no-print md:mr-64 text-center py-3 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        © {new Date().getFullYear()} جميع الحقوق محفوظة
      </footer>

      {!isMuhtasibPage && (
        <button
          onClick={() => navigate('/muhtasib')}
          className="no-print fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl shadow-lg transition-all text-sm font-medium"
          title="انتقل للمحتسب"
        >
          <Calculator size={18} />
          <span>المحتسب</span>
        </button>
      )}
    </div>
  )
}
