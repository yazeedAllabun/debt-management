import { useState } from 'react'
import { useClients } from '../../hooks/useClients'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react'

const STORAGE_KEY = 'owner_pin'

function getStoredPin() {
  const val = localStorage.getItem(STORAGE_KEY)
  return val ? atob(val) : null
}

function storePin(pin) {
  localStorage.setItem(STORAGE_KEY, btoa(pin))
}

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'

export function OwnerPage() {
  const storedPin = getStoredPin()
  const isFirstTime = !storedPin

  const [step, setStep]           = useState(isFirstTime ? 'setup' : 'login') // 'setup' | 'login' | 'dashboard' | 'change'
  const [pin, setPin]             = useState('')
  const [confirmPin, setConfirm]  = useState('')
  const [newPin, setNewPin]       = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [showPin, setShowPin]     = useState(false)
  const [error, setError]         = useState('')

  const { clients } = useClients()
  const stats = useDashboardStats(clients)

  // --- Setup first PIN ---
  const handleSetup = () => {
    if (pin.length < 4) return setError('كلمة المرور يجب أن تكون 4 أرقام على الأقل')
    if (pin !== confirmPin) return setError('كلمتا المرور غير متطابقتين')
    storePin(pin)
    setError('')
    setStep('dashboard')
  }

  // --- Login ---
  const handleLogin = () => {
    if (pin === getStoredPin()) {
      setError('')
      setStep('dashboard')
    } else {
      setError('كلمة المرور غير صحيحة')
    }
  }

  // --- Change PIN ---
  const handleChange = () => {
    if (pin !== getStoredPin()) return setError('كلمة المرور الحالية غير صحيحة')
    if (newPin.length < 4)       return setError('كلمة المرور الجديدة يجب أن تكون 4 أرقام على الأقل')
    if (newPin !== confirmNew)   return setError('كلمتا المرور الجديدة غير متطابقتين')
    storePin(newPin)
    setError('')
    setPin('')
    setNewPin('')
    setConfirmNew('')
    setStep('dashboard')
  }

  // ======== SETUP SCREEN ========
  if (step === 'setup') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound size={26} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">إعداد كلمة مرور المالك</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">أول مرة — حدد كلمة مرور للوصول</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-3 text-right">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => setPin(e.target.value)}
              className={inputCls}
              placeholder="كلمة المرور"
            />
            <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input
            type="password"
            value={confirmPin}
            onChange={e => setConfirm(e.target.value)}
            className={inputCls}
            placeholder="تأكيد كلمة المرور"
            onKeyDown={e => e.key === 'Enter' && handleSetup()}
          />
        </div>
        <button onClick={handleSetup} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
          تعيين كلمة المرور
        </button>
      </div>
    </div>
  )

  // ======== LOGIN SCREEN ========
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
          <input
            type={showPin ? 'text' : 'password'}
            value={pin}
            onChange={e => setPin(e.target.value)}
            className={inputCls}
            placeholder="كلمة المرور"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button onClick={handleLogin} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
          دخول
        </button>
      </div>
    </div>
  )

  // ======== CHANGE PIN SCREEN ========
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
          <button onClick={handleChange} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">حفظ</button>
          <button onClick={() => { setStep('dashboard'); setError('') }} className="px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">إلغاء</button>
        </div>
      </div>
    </div>
  )

  // ======== OWNER DASHBOARD ========
  const netProfit = stats.totalProfit

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">صفحة المالك</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">الملخص المالي الكامل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setStep('change'); setPin(''); setError('') }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
          >
            <KeyRound size={15} />
            تغيير كلمة المرور
          </button>
          <button
            onClick={() => { setStep('login'); setPin('') }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"
          >
            <Lock size={15} />
            قفل
          </button>
        </div>
      </div>

      {/* صافي الربح — البطاقة الرئيسية */}
      <div className="bg-gradient-to-l from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-green-100 text-sm mb-1">صافي الربح الإجمالي</p>
        <p className="text-4xl font-bold">{formatCurrency(netProfit)}</p>
        <p className="text-green-100 text-xs mt-2">من إجمالي {formatNumber(stats.totalClients)} عميل</p>
      </div>

      {/* ملخص مالي */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الديون',   value: formatCurrency(stats.totalDebt) },
          { label: 'إجمالي السداد',   value: formatCurrency(stats.totalPaid) },
          { label: 'تم السداد',       value: formatNumber(stats.paymentDone) + ' عميل' },
          { label: 'الحالات المعلقة', value: formatNumber(stats.pendingCases) + ' حالة' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
