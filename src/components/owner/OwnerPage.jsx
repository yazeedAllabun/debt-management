import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import { useEmployees } from '../../hooks/useEmployees'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { supabase } from '../../lib/supabase'
import { LogOut, Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft, UserPlus, Trash2, Users, HelpCircle, Pencil, X } from 'lucide-react'

/* ─── Constants ─── */
const QUESTIONS = [
  'ما اسم أول مدرسة درست فيها؟',
  'ما اسم مدينة ولادتك؟',
  'ما اسم حيوانك الأليف الأول؟',
  'ما اسم والدتك قبل الزواج؟',
  'ما هو طبقك المفضل؟',
  'ما اسم أفضل صديق في طفولتك؟',
  'ما اسم الشارع الذي نشأت فيه؟',
  'ما هي السيارة الأولى التي امتلكتها؟',
  'ما اسم المدينة التي قضيت فيها طفولتك؟',
  'ما اسم معلمك المفضل؟',
  'ما اسم أول عمل عملته؟',
  'ما اسم جدك لأبيك؟',
]

/* ─── Helpers ─── */
const fetchPin = async () => {
  const { data } = await supabase.from('settings').select('value').eq('key', 'owner_pin').single()
  return data?.value ? atob(data.value) : null
}
const savePin = async (p) => {
  await supabase.from('settings').upsert({ key: 'owner_pin', value: btoa(p) })
}

const fetchSecurityData = async () => {
  const { data } = await supabase.from('settings').select('key,value')
    .in('key', ['owner_security_q1','owner_security_a1','owner_security_q2','owner_security_a2','owner_security_q3','owner_security_a3'])
  if (!data || data.length < 6) return null
  const m = Object.fromEntries(data.map(r => [r.key, r.value]))
  if (!m.owner_security_q1) return null
  return [
    { q: m.owner_security_q1, a: m.owner_security_a1 },
    { q: m.owner_security_q2, a: m.owner_security_a2 },
    { q: m.owner_security_q3, a: m.owner_security_a3 },
  ]
}

const randomQs = () => {
  const idx = [...Array(QUESTIONS.length).keys()]
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return [0, 1, 2].map(i => ({ q: QUESTIONS[idx[i]], a: '' }))
}

const saveSecurityData = async (pairs) => {
  const rows = []
  pairs.forEach((p, i) => {
    rows.push({ key: `owner_security_q${i+1}`, value: p.q })
    rows.push({ key: `owner_security_a${i+1}`, value: btoa(p.a.trim().toLowerCase()) })
  })
  await supabase.from('settings').upsert(rows)
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
  const [phone, setPhone] = useState('')
  const [role, setRole]   = useState('موظف')
  const [perms, setPerms] = useState(['view_dashboard', 'view_clients'])
  const [err, setErr]     = useState('')

  const togglePerm = (key) =>
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])

  const handleSave = () => {
    if (!name.trim()) return setErr('الاسم مطلوب')
    onSave({ name: name.trim(), phone: phone.trim(), role, permissions: perms, password: null })
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
  const [pin, setPin]               = useState('')
  const [confirmPin, setConfirm]    = useState('')
  const [newPin, setNewPin]         = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [showPin, setShowPin]       = useState(false)
  const [error, setError]           = useState('')
  const [activeTab, setActiveTab]   = useState('overview')
  const [showForm, setShowForm]     = useState(false)
  const [saving, setSaving]         = useState(false)

  const [securityPairs, setSecurityPairs] = useState(randomQs)
  const [setupQSource, setSetupQSource]   = useState('setup')
  const [forgotQs, setForgotQs]          = useState(null)
  const [forgotAnswers, setForgotAnswers] = useState(['', '', ''])

  const { clients } = useClients()
  const stats = useDashboardStats(clients)
  const { employees, loading: empsLoading, addEmployee, deleteEmployee, updateEmployee } = useEmployees()
  const [editingId, setEditingId]   = useState(null)
  const [editRole, setEditRole]     = useState('')
  const [editPerms, setEditPerms]   = useState([])

  useEffect(() => {
    fetchPin().then(p => {
      setStoredPin(p)
      if (!p)           setStep('setup')
      else if (isOwner) setStep('dashboard')
      else              setStep('login')
    })
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

  const goToForgot = async () => {
    setError('')
    setForgotAnswers(['', '', ''])
    const data = await fetchSecurityData()
    if (!data) {
      setError('لم يتم إعداد أسئلة الأمان بعد')
      return
    }
    setForgotQs(data)
    setStep('forgot')
  }

  /* ── LOADING ── */
  if (step === 'loading') return (
    <div className="flex items-center justify-center py-32">
      <div className="text-gray-400 dark:text-gray-500">جاري التحميل...</div>
    </div>
  )

  /* ── SETUP — PIN entry ── */
  if (step === 'setup') return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center space-y-5">
        <div className="flex justify-center items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">1</div>
          <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-400">2</div>
        </div>
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound size={26} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">إعداد كلمة مرور المالك</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">الخطوة 1 من 2</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-3 text-right">
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
          if (pin.length < 4) return setError('4 أحرف على الأقل')
          if (pin !== confirmPin) return setError('كلمتا المرور غير متطابقتين')
          await savePin(pin)
          setStoredPin(pin)
          setError('')
          setStep('setupQ')
        }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
          التالي ←
        </button>
      </div>
    </div>
  )

  /* ── SETUP — Security Questions ── */
  if (step === 'setupQ') return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-5">
        <div className="flex justify-center items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-500 text-white">✓</div>
          <div className="w-12 h-0.5 bg-green-400" />
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">2</div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">أسئلة الأمان</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {setupQSource === 'dashboard' ? 'تحديث أسئلة الأمان' : 'الخطوة 2 من 2'} — اختر 3 أسئلة مختلفة وأجب عنها
          </p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}
        <div className="space-y-4">
          {securityPairs.map((pair, i) => (
            <div key={i} className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">السؤال {i + 1}</label>
              <select value={pair.q}
                onChange={e => {
                  const copy = [...securityPairs]
                  copy[i] = { ...copy[i], q: e.target.value }
                  setSecurityPairs(copy)
                }}
                className={inputCls}>
                {QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <input type="text" value={pair.a}
                onChange={e => {
                  const copy = [...securityPairs]
                  copy[i] = { ...copy[i], a: e.target.value }
                  setSecurityPairs(copy)
                }}
                className={inputCls} placeholder="إجابتك (غير حساسة لحالة الأحرف)" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={async () => {
            if (securityPairs.some(p => !p.a.trim())) return setError('يرجى الإجابة على جميع الأسئلة')
            if (new Set(securityPairs.map(p => p.q)).size < 3) return setError('يرجى اختيار 3 أسئلة مختلفة')
            await saveSecurityData(securityPairs)
            setError('')
            if (setupQSource === 'dashboard') {
              setStep('dashboard')
            } else {
              await ownerLogin()
              setStep('dashboard')
            }
          }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            {setupQSource === 'dashboard' ? 'حفظ الأسئلة' : 'حفظ وتسجيل الدخول'}
          </button>
          <button onClick={() => { setStep(setupQSource === 'dashboard' ? 'dashboard' : 'setup'); setError('') }}
            className="px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm">
            رجوع
          </button>
        </div>
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
            onKeyDown={async e => {
              if (e.key === 'Enter') {
                if (pin === storedPin) { setError(''); await ownerLogin(); setStep('dashboard') }
                else setError('كلمة المرور غير صحيحة')
              }
            }} />
          <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button onClick={async () => {
          if (pin === storedPin) { setError(''); await ownerLogin(); setStep('dashboard') }
          else setError('كلمة المرور غير صحيحة')
        }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
          دخول
        </button>
        <button onClick={() => { setPin(''); setError(''); goToForgot() }}
          className="w-full py-1.5 text-sm text-blue-500 dark:text-blue-400 hover:underline">
          نسيت كلمة المرور؟
        </button>
        <button onClick={() => navigate('/')} className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:underline">
          رجوع للرئيسية
        </button>
      </div>
    </div>
  )

  /* ── FORGOT — Security Questions ── */
  if (step === 'forgot') return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">استعادة كلمة المرور</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">أجب على أسئلة الأمان لتعيين كلمة مرور جديدة</p>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}
        <div className="space-y-4">
          {forgotQs?.map((pair, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{pair.q}</p>
              <input type="text" value={forgotAnswers[i]}
                onChange={e => {
                  const copy = [...forgotAnswers]
                  copy[i] = e.target.value
                  setForgotAnswers(copy)
                }}
                className={inputCls} placeholder="إجابتك" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <button onClick={() => {
            const correct = forgotQs.every((p, i) =>
              btoa(forgotAnswers[i].trim().toLowerCase()) === p.a
            )
            if (correct) {
              setError('')
              setStep('resetPin')
            } else {
              setError('إجابة واحدة أو أكثر غير صحيحة، حاول مرة أخرى')
            }
          }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            تحقق
          </button>
          <button onClick={() => { setError(''); setStep('login') }}
            className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:underline">
            رجوع لتسجيل الدخول
          </button>
        </div>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تم التحقق من أسئلة الأمان</p>
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
          setNewPin('')
          setConfirmNew('')
          setError('')
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">صفحة المالك</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">الملخص المالي الكامل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setSetupQSource('dashboard'); setSecurityPairs(randomQs()); setError(''); setStep('setupQ') }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
            <HelpCircle size={14} /> أسئلة الأمان
          </button>
          <button onClick={() => { setStep('change'); setPin(''); setError('') }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
            <KeyRound size={14} /> تغيير كلمة المرور
          </button>
          <button onClick={() => { ownerLogout(); setStep('login'); setPin('') }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors">
            <LogOut size={14} /> خروج
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
                  {/* ── بيانات الموظف ── */}
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
                      <button
                        onClick={() => {
                          if (editingId === emp.id) { setEditingId(null); return }
                          setEditingId(emp.id)
                          setEditRole(emp.role)
                          setEditPerms(emp.permissions || [])
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          editingId === emp.id
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                            : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                        title="تعديل"
                      >
                        {editingId === emp.id ? <X size={15} /> : <Pencil size={15} />}
                      </button>
                      <button onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* ── نموذج التعديل (inline) ── */}
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
                              onClick={() => setEditPerms(prev =>
                                prev.includes(p.key) ? prev.filter(k => k !== p.key) : [...prev, p.key]
                              )}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                editPerms.includes(p.key)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                              }`}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={async () => {
                            try {
                              await updateEmployee(emp.id, { role: editRole, permissions: editPerms })
                              setEditingId(null)
                            } catch (e) { setError(e.message) }
                          }}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
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
