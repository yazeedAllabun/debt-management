import { useNavigate } from 'react-router-dom'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { useClients } from '../../hooks/useClients'
import { formatCurrency, formatNumber, calcProfit } from '../../utils/formatters'
import { Lock, UsersRound, TrendingUp, UserCheck, Banknote, ArrowLeft } from 'lucide-react'

const getEmps = () => {
  try { return JSON.parse(localStorage.getItem('employees') || '[]') } catch { return [] }
}

const ROLE_COLOR = {
  موظف:   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  مشرف:   'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  محاسب:  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  مدير:   'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
}

export function EmployeesPage() {
  const navigate = useNavigate()
  const { isOwner } = useOwnerSession()
  const { clients } = useClients()
  const employees = getEmps()

  /* حماية الصفحة — للمالك فقط */
  if (!isOwner) {
    return (
      <div className="max-w-sm mx-auto mt-20 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 space-y-5">
          <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/40 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={26} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">هذه الصفحة خاصة بالمالك فقط</p>
          <button
            onClick={() => navigate('/owner')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            الدخول لصفحة المالك
          </button>
        </div>
      </div>
    )
  }

  /* إحصائيات كل موظف */
  const employeeStats = employees.map(emp => {
    const empClients = clients.filter(c => c.added_by === emp.name)
    const totalDebt   = empClients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0)
    const totalProfit = empClients.reduce((s, c) => s + calcProfit(c.debt_amount, c.commission_pct), 0)
    const doneCnt     = empClients.filter(c => c.payment_status === 'paid').length
    return { ...emp, clientCount: empClients.length, totalDebt, totalProfit, doneCnt }
  })

  /* العملاء غير المنسوبين لأحد */
  const unassigned = clients.filter(c => !c.added_by)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/owner')}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="رجوع لصفحة المالك"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">إنتاجية الموظفين</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {employees.length} موظف مسجّل • إجمالي العملاء: {formatNumber(clients.length)}
          </p>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
          <UsersRound size={40} className="mx-auto mb-3 opacity-30" />
          <p>لا يوجد موظفون مسجّلون بعد</p>
          <button
            onClick={() => navigate('/owner')}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            إضافة موظفين من صفحة المالك
          </button>
        </div>
      ) : (
        <>
          {/* بطاقات الموظفين */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {employeeStats.map(emp => (
              <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
                {/* الاسم والدور */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{emp.name}</p>
                    {emp.phone && <p className="text-xs text-gray-400 mt-0.5">{emp.phone}</p>}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLOR[emp.role] || ROLE_COLOR['موظف']}`}>
                    {emp.role}
                  </span>
                </div>

                {/* إحصائيات */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl py-3">
                    <UserCheck size={16} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatNumber(emp.clientCount)}</p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">عميل</p>
                  </div>
                  <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl py-3">
                    <Banknote size={16} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">{formatCurrency(emp.totalDebt)}</p>
                    <p className="text-xs text-gray-400">إجمالي</p>
                  </div>
                  <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-xl py-3">
                    <TrendingUp size={16} className="mx-auto text-green-500 mb-1" />
                    <p className="text-sm font-bold text-green-700 dark:text-green-300 leading-tight">{formatCurrency(emp.totalProfit)}</p>
                    <p className="text-xs text-green-500 dark:text-green-400">ربح</p>
                  </div>
                </div>

                {/* شريط الإنجاز */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>تم السداد</span>
                    <span>{emp.doneCnt} / {emp.clientCount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: emp.clientCount > 0 ? `${(emp.doneCnt / emp.clientCount) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* العملاء غير المنسوبين */}
          {unassigned.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 flex items-center gap-3">
              <UsersRound size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-semibold">{unassigned.length} عميل</span> غير منسوب لأي موظف
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
