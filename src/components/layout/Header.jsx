import { Sun, Moon, Building2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="no-print fixed top-0 right-0 left-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 shadow-sm">
      {/* Right side: Logo + Company Name */}
      <div className="flex items-center gap-3">
        {/* Logo placeholder */}
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center overflow-hidden">
          <Building2 size={22} className="text-blue-600 dark:text-blue-400" />
          {/* Replace with: <img src="/logo.png" alt="شعار الشركة" className="w-full h-full object-contain" /> */}
        </div>
        {/* Company name placeholder */}
        <div>
          <h1 className="text-base font-bold text-gray-800 dark:text-gray-100 leading-tight">
            شركة تسديد الديون
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">لوحة التحكم</p>
        </div>
      </div>

      {/* Left side: Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  )
}
