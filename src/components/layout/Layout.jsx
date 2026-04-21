import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Calculator } from 'lucide-react'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { useEmployeeSession } from '../../context/EmployeeSessionContext'
import { EmployeeLogin } from '../auth/EmployeeLogin'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isCalculatorPage = location.pathname === '/calculator'
  const { isOwner } = useOwnerSession()
  const { currentEmployee } = useEmployeeSession()

  // بوابة المصادقة: اعرض شاشة تسجيل الدخول إن لم يكن هناك جلسة نشطة
  // استثناء: مسار /owner دائماً متاح لتسجيل دخول المالك
  if (!isOwner && !currentEmployee && location.pathname !== '/owner') {
    return <EmployeeLogin />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onMenuClick={() => setSidebarOpen(o => !o)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="md:mr-64 pt-16 min-h-screen">
        <div className="p-4 md:p-6 print-full">
          <Outlet />
        </div>
      </main>

      {/* زر المحتسب العائم — يظهر في كل الصفحات ما عدا صفحة المحتسب */}
      {!isCalculatorPage && (
        <button
          onClick={() => navigate('/calculator')}
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
