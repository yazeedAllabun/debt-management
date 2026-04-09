import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileBarChart2,
  Calculator,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'

const navItems = [
  { to: '/',           label: 'الرئيسية',    icon: LayoutDashboard },
  { to: '/clients',    label: 'العملاء',     icon: Users },
  { to: '/add-client', label: 'إضافة عميل', icon: UserPlus },
  { to: '/reports',    label: 'التقارير',    icon: FileBarChart2 },
]

// أضف الأسماء والروابط هنا عند توفرها
const calculators = [
  { label: 'المحتسب 1', url: '#' },
  { label: 'المحتسب 2', url: '#' },
  { label: 'المحتسب 3', url: '#' },
]

export function Sidebar() {
  const [calcOpen, setCalcOpen] = useState(false)

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

        {/* المحتسب — قائمة قابلة للطي */}
        <div>
          <button
            onClick={() => setCalcOpen(o => !o)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <Calculator size={19} />
            <span className="flex-1 text-right">المحتسب</span>
            {calcOpen
              ? <ChevronUp size={15} className="text-gray-400" />
              : <ChevronDown size={15} className="text-gray-400" />
            }
          </button>

          {/* القائمة الفرعية */}
          {calcOpen && (
            <div className="mt-1 mr-4 space-y-1 border-r-2 border-blue-100 dark:border-blue-900/40 pr-3">
              {calculators.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target={url !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ExternalLink size={13} className="shrink-0" />
                  <span>{label}</span>
                  {url === '#' && (
                    <span className="mr-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">
                      قريباً
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
          نظام إدارة الديون
        </p>
      </div>
    </aside>
  )
}
