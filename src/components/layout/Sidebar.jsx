import { NavLink } from 'react-router-dom'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileBarChart2,
  Calculator,
  BotMessageSquare,
  ClipboardList,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'

const navItems = [
  { to: '/',                  label: 'الرئيسية',      icon: LayoutDashboard },
  { to: '/clients',           label: 'العملاء',       icon: Users },
  { to: '/add-client',        label: 'إضافة عميل',   icon: UserPlus },
  { to: '/reports',           label: 'التقارير',      icon: FileBarChart2 },
  { to: '/calculator',        label: 'المحتسب',       icon: Calculator },
  { to: '/claude-calculator', label: 'محتسب كلاود',  icon: BotMessageSquare },
  { to: '/calculations',      label: 'الحسبات',       icon: ClipboardList },
]

export function Sidebar({ open, onClose }) {
  const { isOwner } = useOwnerSession()

  return (
    <aside className={`
      no-print fixed top-16 right-0 h-[calc(100vh-4rem)] w-64
      bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700
      flex flex-col z-20 shadow-sm transition-transform duration-300
      ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
    `}>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
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
      </nav>

      {/* صفحة الموظفون — للمالك فقط */}
      {isOwner && (
        <div className="px-3 pb-1">
          <NavLink
            to="/employees"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <UsersRound size={19} />
            <span>الموظفون</span>
          </NavLink>
        </div>
      )}

      {/* صفحة المالك — في الأسفل */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <NavLink
          to="/owner"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              isActive
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`
          }
        >
          <ShieldCheck size={19} />
          <span>صفحة المالك</span>
        </NavLink>
      </div>
    </aside>
  )
}
