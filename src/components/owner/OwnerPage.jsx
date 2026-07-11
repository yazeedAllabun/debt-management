import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import { useEmployees } from '../../hooks/useEmployees'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { supabase } from '../../lib/supabase'
import { LogOut, Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft, UserPlus, Trash2, Users, Pencil, Key, Mail, RefreshCw, Settings } from 'lucide-react'

/* ─── Helpers ─── */
const fetchPin = async () => {
  const { data } = await supabase.from('settings').select('value').eq('key', 'owner_pin').single()
  return data?.value ? atob(data.value) : null
}
const savePin = async (p) => {
  await supabase.from('settings').upsert({ key: 'owner_pin', value: btoa(p) })
}
const fetchOwnerName = async () => {
  const { data } = await supabase.from('settings').select('value').eq('key', 'owner_name').single()
  return data?.value || null
}
const saveOwnerName = async (name) => {
  await supabase.from('settings').upsert({ key: 'owner_name', value: name })
}

/* ─── OTP helpers (Email) ─── */
const maskEmail = (email) => {
  const [user, domain] = email.split('@')
  return user.slice(0, 2) + '***@' + domain
}
const fetchOwnerEmail = async () => {
  const { data } = await supabase.from('settings').select('value').eq('key', 'owner_email').single()
  return data?.value || null
}
const saveOwnerEmail = async (email) => {
  await supabase.from('settings').upsert({ key: 'owner_email', value: email })
}
const sendOtp = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({ email })
  return error
}
const verifyOtpCode = async (email, token) => {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  return error
}

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
function EmployeeForm({ onSave, onCancel, saving }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState('موظف')
  const [perms, setPerms] = useState(['view_dashboard', 'view_clients'])
  const [err, setErr]     = useState('')

  const togglePerm = (key) =>
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])

  const handleSave = () => {
    if (!name.trim()) return setErr('الاسم مطلوب')
    if (email && !email.includes('@')) return setErr('البريد الإلكتروني غير صحيح')
    onSave({ name: name.trim(), email: email.trim().toLowerCase() || null, role, permissions: perms, password: null })
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-5 space-y-4 border border-gray-200 dark:border-gray-600">
      <h4 className="font-semibold text-gray-700 dark:text-gray-200">بيانات الموظف</h4>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="الاسم *" />
        <input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="البريد الإلكتروني (للـ OTP)" type="email" dir="ltr" />
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
            <button key={p.key} type="button" onClick={() => togglePerm(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                perms.includes(p.key)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors">
          {saving ? 'جاري الحفظ...' : 'حفظ الموظف'}
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded-xl transition-colors">
          إلغاء
        </button>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export function OwnerPage() {
  const navigate = useNavigate()
  const { isOwner, ownerLogin, ownerLogout } = useOwnerSession()

  const [step, setStep]             = useState('loading')
  const [storedPin, setStoredPin]   = useState(null)
  const [ownerName, setOwnerName]   = useState('')
  const [nameInput, setNameInput]   = useState('')
  const [pin, setPin]               = useState('')
  const [confirmPin, setConfirm]    = useState('')
  const [newPin, setNewPin]         = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [showPin, setShowPin]       = useState(false)
  const [error, setError]           = useState('')
  const [activeTab, setActiveTab]   = useState('overview')
  const [showForm, setShowForm]     = useState(false)
  const [saving, setSaving]         = useState(false)

  const [emailInput, setEmailInput]     = useState('')
  const [loginEmail, setLoginEmail]     = useState('')
  const [otpCode, setOtpCode]           = useState('')
  const [otpSending, setOtpSending]     = useState(false)
  const [fromDashboard, setFromDashboard] = useState(false)
  const [otpFailed, setOtpFailed]       = useState(false)

  const { clients } = useClients()
  const stats = useDashboardStats(clients)
  const { employees, loading: empsLoading, addEmployee, deleteEmployee, updateEmployee, updateEmployeePassword } = useEmployees()
  const [editingId, setEditingId]     = useState(null)
  const [editRole, setEditRole]       = useState('')
  const [editPerms, setEditPerms]     = useState([])
  const [passId, setPassId]           = useState(null)
  const [newEmpPass, setNewEmpPass]   = useState('')
  const [confEmpPass, setConfEmpPass] = useState('')
  const [showEmpPass, setShowEmpPass] = useState(false)
  const [passError, setPassError]     = useState('')

  useEffect(() => {
    fetchPin()
      .then(async p => {
        setStoredPin(p)
        const name = await fetchOwnerName()
        if (name) setOwnerName(name)
        if (!p)           setStep('setup')
        else if (isOwner) setStep('dashboard')
        else              setStep('login')
      })
      .catch(() => setStep('login'))
  }, [isOwner])


  const handleAddEmployee = async (empData) => {
    setSaving(true)
    try { await addEmployee(empData); setShowForm(false) }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('هل تريد حذف هذا الموظف؟')) return
    try { await deleteEmployee(id) } catch (e) { setError(e.message) }
  }

  /* ── LOADING ── */
  if (step === 'loading') return (
    <div className="flex items-center justify-center py-32">
      <div className="text-gray-400 dark:text-gray-500">جاري التحميل...</div>
    </div>
  )

  /* ── SETUP step 1 — Name + PIN ── */
  if (step === 'setup') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="flex justify-center items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">1</div>
          <div className="w-10 h-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-400">2</div>
        </div>
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound size={26} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">إعداد حساب المالك</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">الخطوة 1 من 2</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-3 text-right">
          <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
            className={inputCls} placeholder="اسم المالك *" />
          <div className="relative">
            <input type={showPin ? 'text' : 'password'} value={pin} onChange={e => setPin(e.target.value)}
              className={inputCls} placeholder="كلمة المرور" />
            <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input type="password" value={confirmPin} onChange={e => setConfirm(e.target.value)}
            className={inputCls} placeholder="تأكيد كلمة المرور" />
        </div>
        <button onClick={async () => {
          if (!nameInput.trim()) return setError('اسم المالك مطلوب')
          if (pin.length < 4) return setError('4 أحرف على الأقل')
          if (pin !== confirmPin) return setError('كلمتا المرور غير متطابقتين')
          try {
            await saveOwnerName(nameInput.trim())
            await savePin(pin)
            setOwnerName(nameInput.trim())
            setStoredPin(pin)
            setError('')
            setStep('setupPhone')
          } catch (e) { setError('فشل الحفظ: ' + (e.message || '')) }
        }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
          التالي ←
        </button>
      </div>
    </div>
  )

  /* ── SETUP step 2 — Email ── */
  if (step === 'setupPhone') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        {!fromDashboard && (
          <div className="flex justify-center items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-500 text-white">✓</div>
            <div className="w-10 h-0.5 bg-green-400" />
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">2</div>
          </div>
        )}
        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <Mail size={26} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">البريد الإلكتروني</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {fromDashboard ? 'تحديث البريد الإلكتروني للـ OTP' : 'الخطوة 2 من 2 — سيُرسل رمز OTP عبر البريد'}
          </p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <input
          type="email"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          className={inputCls}
          placeholder="example@gmail.com"
          dir="ltr"
        />
        <div className="flex gap-3">
          <button onClick={async () => {
            if (!emailInput.includes('@')) return setError('البريد الإلكتروني غير صحيح')
            try {
              await saveOwnerEmail(emailInput.trim().toLowerCase())
              setError('')
              if (fromDashboard) { setFromDashboard(false); setStep('dashboard') }
              else { await ownerLogin(); setStep('dashboard') }
            } catch (e) { setError('فشل الحفظ: ' + (e.message || '')) }
          }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            {fromDashboard ? 'حفظ' : 'حفظ وتسجيل الدخول ←'}
          </button>
          <button onClick={() => { setStep(fromDashboard ? 'dashboard' : 'setup'); setFromDashboard(false); setError('') }}
            className="px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm transition-colors">
            رجوع
          </button>
        </div>
        {!fromDashboard && (
          <button onClick={async () => {
            try { await ownerLogin(); setStep('dashboard') }
            catch (e) { setError('فشل: ' + (e.message || '')) }
          }} className="w-full py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:underline">
            تخطي (بدون OTP)
          </button>
        )}
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
          <input type={showPin ? 'text' : 'password'} value={pin} onChange={e => setPin(e.target.value)}
            className={inputCls} placeholder="كلمة المرور"
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} />
          <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button onClick={async () => {
          if (pin !== storedPin) return setError('كلمة المرور غير صحيحة')
          setError(''); setOtpFailed(false)
          setOtpSending(true)
          const email = await fetchOwnerEmail()
          if (!email) {
            setOtpSending(false)
            await ownerLogin()
            setStep('dashboard')
            return
          }
          const err = await sendOtp(email)
          setOtpSending(false)
          if (err) {
            setOtpFailed(true)
            return setError('فشل الإرسال: ' + (err.message || ''))
          }
          setLoginEmail(email); setOtpCode(''); setStep('otpVerify')
        }} disabled={otpSending} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
          {otpSending ? 'جاري إرسال الرمز...' : 'دخول'}
        </button>
        {otpFailed && (
          <button onClick={async () => {
            if (pin !== storedPin) return setError('كلمة المرور غير صحيحة')
            await ownerLogin(); setStep('dashboard')
          }} className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-xl transition-colors">
            دخول بكلمة المرور فقط
          </button>
        )}
        <button onClick={async () => {
          setError(''); setPin('')
          const email = await fetchOwnerEmail()
          if (!email) return setError('لم يتم تسجيل بريد إلكتروني — أضفه من لوحة التحكم')
          setOtpSending(true)
          const err = await sendOtp(email)
          setOtpSending(false)
          if (err) return setError('فشل الإرسال: ' + (err.message || ''))
          setLoginEmail(email); setOtpCode(''); setStep('forgotOtp')
        }} disabled={otpSending}
          className="w-full py-1.5 text-sm text-blue-500 dark:text-blue-400 hover:underline disabled:opacity-50">
          نسيت كلمة المرور؟
        </button>
        <button onClick={async () => {
          const p = await fetchPin()
          if (p) return setError('يوجد حساب مالك مسجّل — استخدم كلمة المرور أو "نسيت كلمة المرور"')
          setNameInput(''); setPin(''); setConfirm(''); setError('')
          setStep('setup')
        }} className="w-full py-1.5 text-sm text-green-600 dark:text-green-400 hover:underline">
          تسجيل مالك جديد
        </button>
        <button onClick={async () => {
          if (!window.confirm('سيتم حذف بيانات المالك نهائياً. هل أنت متأكد؟')) return
          try {
            await supabase.from('settings').delete().in('key', ['owner_pin', 'owner_session_token', 'owner_name', 'owner_email'])
            ownerLogout()
            setStoredPin(null); setOwnerName(''); setPin(''); setNameInput(''); setError('')
            setStep('setup')
          } catch (e) { setError('فشل الحذف: ' + (e.message || '')) }
        }} className="w-full py-1.5 text-sm text-red-500 dark:text-red-400 hover:underline">
          حذف المالك الحالي
        </button>
        <button onClick={() => navigate('/')} className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:underline">
          رجوع للرئيسية
        </button>
      </div>
    </div>
  )

  /* ── OTP VERIFY (login) ── */
  if (step === 'otpVerify') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <Mail size={26} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">رمز التحقق</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تم إرسال رمز 6 أرقام إلى</p>
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-0.5" dir="ltr">{maskEmail(loginEmail)}</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <input type="text" inputMode="numeric" maxLength={8} value={otpCode}
          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
          className={`${inputCls} text-center text-2xl font-bold tracking-[0.3em]`}
          placeholder="00000000" dir="ltr" autoFocus />
        <button onClick={async () => {
          if (otpCode.length < 6) return setError('أدخل الرمز كاملاً')
          const err = await verifyOtpCode(loginEmail, otpCode)
          if (err) return setError('الرمز غير صحيح أو انتهت صلاحيته')
          setError(''); await ownerLogin(); setStep('dashboard')
        }} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
          تحقق وادخل
        </button>
        <button onClick={async () => {
          setError(''); setOtpSending(true)
          await sendOtp(loginEmail); setOtpSending(false)
        }} disabled={otpSending}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-purple-500 dark:text-purple-400 hover:underline disabled:opacity-50">
          <RefreshCw size={13} className={otpSending ? 'animate-spin' : ''} />
          {otpSending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
        </button>
        <button onClick={() => { setStep('login'); setOtpCode(''); setError('') }}
          className="w-full py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:underline">رجوع</button>
      </div>
    </div>
  )

  /* ── FORGOT OTP ── */
  if (step === 'forgotOtp') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <Mail size={26} className="text-orange-500 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">استعادة كلمة المرور</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تم إرسال رمز 6 أرقام إلى</p>
          <p className="text-sm font-medium text-orange-500 dark:text-orange-400 mt-0.5" dir="ltr">{maskEmail(loginEmail)}</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <input type="text" inputMode="numeric" maxLength={8} value={otpCode}
          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
          className={`${inputCls} text-center text-2xl font-bold tracking-[0.3em]`}
          placeholder="00000000" dir="ltr" autoFocus />
        <button onClick={async () => {
          if (otpCode.length < 6) return setError('أدخل الرمز كاملاً')
          const err = await verifyOtpCode(loginEmail, otpCode)
          if (err) return setError('الرمز غير صحيح أو انتهت صلاحيته')
          setError(''); setNewPin(''); setConfirmNew(''); setStep('resetPin')
        }} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors">
          تحقق
        </button>
        <button onClick={async () => {
          setError(''); setOtpSending(true)
          await sendOtp(loginEmail); setOtpSending(false)
        }} disabled={otpSending}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-orange-500 dark:text-orange-400 hover:underline disabled:opacity-50">
          <RefreshCw size={13} className={otpSending ? 'animate-spin' : ''} />
          {otpSending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
        </button>
        <button onClick={() => { setStep('login'); setOtpCode(''); setError('') }}
          className="w-full py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:underline">رجوع</button>
      </div>
    </div>
  )

  /* ── RESET PIN ── */
  if (step === 'resetPin') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound size={26} className="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">تعيين كلمة مرور جديدة</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تم التحقق عبر البريد الإلكتروني</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-3 text-right">
          <div className="relative">
            <input type={showPin ? 'text' : 'password'} value={newPin} onChange={e => setNewPin(e.target.value)}
              className={inputCls} placeholder="كلمة المرور الجديدة" />
            <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input type="password" value={confirmNew} onChange={e => setConfirmNew(e.target.value)}
            className={inputCls} placeholder="تأكيد كلمة المرور" />
        </div>
        <button onClick={async () => {
          if (newPin.length < 4) return setError('4 أحرف على الأقل')
          if (newPin !== confirmNew) return setError('كلمتا المرور غير متطابقتين')
          await savePin(newPin)
          setStoredPin(newPin)
          setNewPin(''); setConfirmNew(''); setError('')
          await ownerLogin()
          setStep('dashboard')
        }} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors">
          حفظ وتسجيل الدخول
        </button>
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
          <button onClick={async () => {
            if (pin !== storedPin) return setError('كلمة المرور الحالية غير صحيحة')
            if (newPin.length < 4) return setError('4 أحرف على الأقل')
            if (newPin !== confirmNew) return setError('كلمتا المرور غير متطابقتين')
            await savePin(newPin); setStoredPin(newPin); setError(''); setPin(''); setNewPin(''); setConfirmNew(''); setStep('dashboard')
          }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            حفظ
          </button>
          <button onClick={() => { setStep('dashboard'); setError('') }}
            className="px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )

  /* ── OWNER DASHBOARD ── */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {ownerName ? `مرحباً، ${ownerName}` : 'صفحة المالك'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">الملخص المالي الكامل</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
            <Settings size={14} /> الإعدادات
          </button>
          <button onClick={() => { ownerLogout(); setStep('login'); setPin('') }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors">
            <LogOut size={14} /> خروج
          </button>
          <button onClick={async () => {
            if (!window.confirm('هل أنت متأكد من حذف حساب المالك بالكامل؟ لا يمكن التراجع.')) return
            await supabase.from('settings').delete().in('key', [
              'owner_pin', 'owner_session_token', 'owner_name', 'owner_email',
            ])
            ownerLogout()
            setStoredPin(null); setOwnerName(''); setPin(''); setNameInput('')
            setStep('setup')
          }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm transition-colors">
            <Trash2 size={14} /> حذف المالك
          </button>
        </div>
      </div>

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

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-l from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm mb-1">صافي الربح الإجمالي</p>
            <p className="text-4xl font-bold">{formatCurrency(stats.totalProfit)}</p>
            <p className="text-green-100 text-xs mt-2">من {formatNumber(stats.totalClients)} عميل</p>
          </div>
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
      )}

      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">إدارة الموظفين</h3>
              <p className="text-xs text-gray-400 mt-0.5">{employees.length} موظف مسجّل</p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
                <UserPlus size={15} /> إضافة موظف
              </button>
            )}
          </div>

          {showForm && <EmployeeForm onSave={handleAddEmployee} onCancel={() => setShowForm(false)} saving={saving} />}
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

          {empsLoading ? (
            <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
          ) : employees.length === 0 && !showForm ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              لا يوجد موظفون مسجّلون بعد
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map(emp => (
                <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{emp.name}</p>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{emp.role}</span>
                        {emp.password
                          ? <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">كلمة مرور مُعيَّنة</span>
                          : <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">لم يُعيَّن كلمة مرور</span>
                        }
                      </div>
                      {emp.phone && <p className="text-xs text-gray-400 mt-0.5">{emp.phone}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ALL_PERMISSIONS.filter(p => emp.permissions?.includes(p.key)).map(p => (
                          <span key={p.key} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{p.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => {
                        const opening = passId !== emp.id
                        setPassId(opening ? emp.id : null)
                        setNewEmpPass(''); setConfEmpPass(''); setPassError('')
                        if (opening) setEditingId(null)
                      }} className={`p-1.5 rounded-lg transition-colors ${passId === emp.id ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`} title="تغيير كلمة المرور">
                        <Key size={15} />
                      </button>
                      <button onClick={() => {
                        const opening = editingId !== emp.id
                        setEditingId(opening ? emp.id : null)
                        if (opening) { setEditRole(emp.role); setEditPerms(emp.permissions || []); setPassId(null) }
                      }} className={`p-1.5 rounded-lg transition-colors ${editingId === emp.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`} title="تعديل الصلاحيات">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="حذف">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {passId === emp.id && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-amber-50/60 dark:bg-amber-900/10 p-4 space-y-3">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">تعيين كلمة مرور جديدة لـ {emp.name}</p>
                      {passError && <p className="text-xs text-red-500">{passError}</p>}
                      <div className="relative">
                        <input type={showEmpPass ? 'text' : 'password'} value={newEmpPass} onChange={e => setNewEmpPass(e.target.value)} className={inputCls} placeholder="كلمة المرور الجديدة" />
                        <button onClick={() => setShowEmpPass(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showEmpPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <input type="password" value={confEmpPass} onChange={e => setConfEmpPass(e.target.value)} className={inputCls} placeholder="تأكيد كلمة المرور" />
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          if (newEmpPass.length < 4) return setPassError('4 أحرف على الأقل')
                          if (newEmpPass !== confEmpPass) return setPassError('كلمتا المرور غير متطابقتين')
                          try {
                            await updateEmployeePassword(emp.id, btoa(newEmpPass))
                            setPassId(null); setNewEmpPass(''); setConfEmpPass(''); setPassError('')
                          } catch (e) { setPassError(e.message) }
                        }} className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors">
                          حفظ كلمة المرور
                        </button>
                        <button onClick={() => { setPassId(null); setPassError('') }}
                          className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded-xl transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  {editingId === emp.id && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">المسمى الوظيفي</p>
                        <select value={editRole} onChange={e => setEditRole(e.target.value)} className={inputCls}>
                          <option>موظف</option>
                          <option>مشرف</option>
                          <option>محاسب</option>
                          <option>مدير</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">الصلاحيات</p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_PERMISSIONS.map(p => (
                            <button key={p.key} type="button"
                              onClick={() => setEditPerms(prev => prev.includes(p.key) ? prev.filter(k => k !== p.key) : [...prev, p.key])}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${editPerms.includes(p.key) ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={async () => {
                          try {
                            await updateEmployee(emp.id, { role: editRole, permissions: editPerms })
                            setEditingId(null)
                          } catch (e) { setError(e.message) }
                        }} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
                          حفظ التعديلات
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded-xl transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
