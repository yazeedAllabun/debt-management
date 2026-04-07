import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileBarChart2,
  Calculator,
} from 'lucide-react'

const navItems = [
  { to: '/',           label: 'الرئيسية',    icon: LayoutDashboard },
  { to: '/clients',    label: 'العملاء',     icon: Users },
  { to: '/add-client', label: 'إضافة عميل', icon: UserPlus },
  { to: '/reports',    label: 'التقارير',    icon: FileBarChart2 },
]

export function Sidebar() {
  const calculatorUrl = import.meta.env.VITE_CALCULATOR_URL || '#'

  return (
    <aside className="no-print fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col z-20 shadow-sm">
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Calculator external link */}
        <a
          href={calculatorUrl}
          target={calculatorUrl !== '#' ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <Calculator size={19} />
          <span>المحتسب</span>
          {calculatorUrl === '#' && (
            <span className="mr-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
              قريباً
            </span>
          )}
        </a>
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
          نظام إدارة الديون
        </p>
      </div>
    </aside>
  )
}
