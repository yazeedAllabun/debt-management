import { Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import logoImg from '../../assets/logo.jpg'

export function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="no-print fixed top-0 right-0 left-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">

      {/* Right side: Hamburger (mobile) + Logo + Company Name */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only on mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden shrink-0 bg-white">
          <img src={logoImg} alt="شعار مكتب راكان" className="w-full h-full object-contain" />
        </div>

        {/* Company name */}
        <div>
          <h1 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 leading-tight">
            مكتب راكان للعقارات
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">لوحة التحكم</p>
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
