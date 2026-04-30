import { Sun, Moon, Menu, LogOut, HelpCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useEmployeeSession } from '../../context/EmployeeSessionContext'
import logoImg from '../../assets/logo-dark.png'

export function Header({ onMenuClick, onTour }) {
  const { theme, toggleTheme } = useTheme()
  const { currentEmployee, employeeLogout } = useEmployeeSession()

  return (
    <header className="no-print fixed top-0 right-0 left-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">

      {/* Right side: Hamburger (mobile) + Logo + Company Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          <Menu size={20} />
        </button>

        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden shrink-0">
          <img src={logoImg} alt="شعار مكتب راكان" className="w-full h-full object-contain" />
        </div>

        <div>
          <h1 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 leading-tight">
            راكان للتمويل
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">لوحة التحكم</p>
        </div>
      </div>

      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* اسم الموظف + زر خروج */}
        {currentEmployee && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {currentEmployee.name}
            </span>
            <button
              onClick={employeeLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="تسجيل خروج"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        )}

        {/* أيقونة الجولة التعريفية */}
        <button
          onClick={onTour}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          title="الجولة التعريفية"
        >
          <HelpCircle size={20} />
        </button>

        {/* فراغ بين الأيقونتين */}
        <div className="w-1" />

        {/* تبديل الوضع */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}
