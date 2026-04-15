import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft, UserPlus, Trash2, Users } from 'lucide-react'

/* ─── PIN helpers ─── */
const PIN_KEY      = 'owner_pin'
const EMPLOYEES_KEY = 'employees'
const getPin   = ()  => { const v = localStorage.getItem(PIN_KEY); return v ? atob(v) : null }
const savePin  = (p) => localStorage.setItem(PIN_KEY, btoa(p))
const getEmps  = ()  => { try { return JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || '[]') } catch { return [] } }
const saveEmps = (e) => localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(e))

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'

const ALL_PERMISSIONS = [
  { key: 'view_dashboard', label: 'عرض الرئيسية' },
  { key: 'view_clients',   label: 'عرض العملاء' },
  { key: 'add_clients',    label: 'إضافة عملاء' },
  { key: 'delete_clients', label: 'حذف عملاء' },
  { key: 'view_reports',   label: 'عرض التقارير' },
  { key: 'export_excel',   label: 'تصدير Excel' },
]

/* ─── Employee form ─── */
function EmployeeForm({ onSave, onCancel }) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole]   = useState('موظف')
  const [perms, setPerms] = useState(['view_dashboard', 'view_clients'])
  const [err, setErr]     = useState('')

  const togglePerm = (key) =>
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])

  const handleSave = () => {
    if (!name.trim()) return setErr('الاسم مطلوب')
    onSave({ id: crypto.randomUUID(), name: name.trim(), phone: phone.trim(), role, permissions: perms, created_at: new Date().toISOString() })
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-5 space-y-4 border border-gray-200 dark:border-gray-600">
      <h4 className="font-semibold text-gray-700 dark:text-gray-200">بيانات الموظف</h4>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="الاسم *" />
        <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="رقم الجوال" />
        <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
          <option>موظف</option>
          <option>مشرف</option>
          <option>محاسب</option>
          <option>مدير</option>
        </select>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">الصلاحيات</p>
        <div className="flex flex-wrap gap-2">
          {ALL_PERMISSIONS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => togglePerm(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                perms.includes(p.key)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">حفظ الموظف</button>
        <button onClick={onCancel} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded-xl transition-colors">إلغاء</button>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export function OwnerPage() {
  const navigate    = useNavigate()
  const { ownerLogin, ownerLogout } = useOwnerSession()
  const storedPin   = getPin()
  const isFirstTime = !storedPin

  const [step, setStep]         = useState(isFirstTime ? 'setup' : 'login')
  const [pin, setPin]           = useState('')
  const [confirmPin, setConfirm] = useState('')
  const [newPin, setNewPin]     = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [showPin, setShowPin]   = useState(false)
  const [error, setError]       = useState('')
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'employees'
  const [employees, setEmployees] = useState(getEmps)
  const [showForm, setShowForm]  = useState(false)

  const { clients } = useClients()
  const stats = useDashboardStats(clients)

  const addEmployee = (emp) => {
    const updated = [emp, ...employees]
    setEmployees(updated)
    saveEmps(updated)
    setShowForm(false)
  }

  const deleteEmployee = (id) => {
    if (!window.confirm('هل تريد حذف هذا الموظف؟')) return
    const updated = employees.filter(e => e.id !== id)
    setEmployees(updated)
    saveEmps(updated)
  }

  /* ── SETUP ── */
  if (step === 'setup') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound size={26} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">إعداد كلمة مرور المالك</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">حدد كلمة مرور للوصول لصفحة المالك</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-3 text-right">
          <div className="relative">
            <input type={showPin ? 'text' : 'password'} value={pin} onChange={e => setPin(e.target.value)} className={inputCls} placeholder="كلمة المرور" />
            <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{showPin ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <input type="password" value={confirmPin} onChange={e => setConfirm(e.target.value)} className={inputCls} placeholder="تأكيد كلمة المرور" onKeyDown={e => { if(e.key==='Enter'){ if(pin.length<4)return setError('4 أرقام على الأقل'); if(pin!==confirmPin)return setError('كلمتا المرور غير متطابقتين'); savePin(pin); setError(''); setStep('dashboard') }}} />
        </div>
        <button onClick={() => { if(pin.length<4)return setError('4 أرقام على الأقل'); if(pin!==confirmPin)return setError('كلمتا المرور غير متطابقتين'); savePin(pin); setError(''); ownerLogin(); setStep('dashboard') }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">تعيين كلمة المرور</button>
      </div>
    </div>
  )

  /* ── LOGIN ── */
  if (step === 'login') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <Lock size={26} className="text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">صفحة المالك</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">أدخل كلمة المرور للوصول</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="relative text-right">
          <input type={showPin ? 'text' : 'password'} value={pin} onChange={e => setPin(e.target.value)} className={inputCls} placeholder="كلمة المرور" onKeyDown={e => { if(e.key==='Enter'){ if(pin===getPin()){setError('');ownerLogin();setStep('dashboard')}else{setError('كلمة المرور غير صحيحة')} }}} />
          <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{showPin ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <button onClick={() => { if(pin===getPin()){setError('');ownerLogin();setStep('dashboard')}else{setError('كلمة المرور غير صحيحة')} }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">دخول</button>
        <button onClick={() => navigate('/')} className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:underline">رجوع للرئيسية</button>
      </div>
    </div>
  )

  /* ── CHANGE PIN ── */
  if (step === 'change') return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">تغيير كلمة المرور</h2>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}
        <div className="space-y-3">
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} className={inputCls} placeholder="كلمة المرور الحالية" />
          <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} className={inputCls} placeholder="كلمة المرور الجديدة" />
          <input type="password" value={confirmNew} onChange={e => setConfirmNew(e.target.value)} className={inputCls} placeholder="تأكيد كلمة المرور الجديدة" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => { if(pin!==getPin())return setError('كلمة المرور الحالية غير صحيحة'); if(newPin.length<4)return setError('4 أرقام على الأقل'); if(newPin!==confirmNew)return setError('كلمتا المرور غير متطابقتين'); savePin(newPin); setError(''); setPin(''); setNewPin(''); setConfirmNew(''); setStep('dashboard') }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">حفظ</button>
          <button onClick={() => { setStep('dashboard'); setError('') }} className="px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">إلغاء</button>
        </div>
      </div>
    </div>
  )

  /* ── OWNER DASHBOARD ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="رجوع للرئيسية">
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">صفحة المالك</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">الملخص المالي الكامل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setStep('change'); setPin(''); setError('') }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
            <KeyRound size={14} /> تغيير كلمة المرور
          </button>
          <button onClick={() => { ownerLogout(); setStep('login'); setPin('') }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors">
            <Lock size={14} /> قفل
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[{ key: 'overview', label: 'الملخص المالي', icon: ShieldCheck }, { key: 'employees', label: 'الموظفون', icon: Users }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-l from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm mb-1">صافي الربح الإجمالي</p>
            <p className="text-4xl font-bold">{formatCurrency(stats.totalProfit)}</p>
            <p className="text-green-100 text-xs mt-2">من {formatNumber(stats.totalClients)} عميل</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'إجمالي الديون',    value: formatCurrency(stats.totalDebt) },
              { label: 'إجمالي السداد',    value: formatCurrency(stats.totalPaid) },
              { label: 'تم السداد',        value: formatNumber(stats.paymentDone) + ' عميل' },
              { label: 'الحالات المعلقة',  value: formatNumber(stats.pendingCases) + ' حالة' },
            ].map(item => (
              <div key={item.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EMPLOYEES TAB ── */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">إدارة الموظفين</h3>
              <p className="text-xs text-gray-400 mt-0.5">{employees.length} موظف مسجّل</p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
                <UserPlus size={15} /> إضافة موظف
              </button>
            )}
          </div>

          {showForm && <EmployeeForm onSave={addEmployee} onCancel={() => setShowForm(false)} />}

          {employees.length === 0 && !showForm ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              لا يوجد موظفون مسجّلون بعد
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map(emp => (
                <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{emp.name}</p>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{emp.role}</span>
                    </div>
                    {emp.phone && <p className="text-xs text-gray-400 mt-0.5">{emp.phone}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ALL_PERMISSIONS.filter(p => emp.permissions?.includes(p.key)).map(p => (
                        <span key={p.key} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{p.label}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteEmployee(emp.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
