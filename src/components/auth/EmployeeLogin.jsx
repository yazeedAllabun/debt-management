import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserCircle, KeyRound } from 'lucide-react'
import { useEmployeeSession } from '../../context/EmployeeSessionContext'
import logoImg from '../../assets/logo.jpg'

const EMPLOYEES_KEY = 'employees'
const getEmps   = () => { try { return JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || '[]') } catch { return [] } }
const saveEmps  = (e) => localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(e))

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'

export function EmployeeLogin() {
  const navigate = useNavigate()
  const { employeeLogin } = useEmployeeSession()

  const [employees]         = useState(getEmps)
  const [selectedId, setSelectedId] = useState('')
  const [step, setStep]     = useState('select') // 'select' | 'set_password' | 'enter_password'
  const [password, setPass] = useState('')
  const [confirm, setConf]  = useState('')
  const [showPass, setShow] = useState(false)
  const [error, setError]   = useState('')

  const emp = employees.find(e => e.id === selectedId)

  const handleNext = () => {
    if (!selectedId) return setError('اختر اسمك من القائمة')
    setError('')
    setPass('')
    setConf('')
    setStep(emp.password ? 'enter_password' : 'set_password')
  }

  const handleSetPassword = () => {
    if (password.length < 4) return setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل')
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين')
    const updated = getEmps().map(e => e.id === emp.id ? { ...e, password: btoa(password) } : e)
    saveEmps(updated)
    employeeLogin({ ...emp, password: btoa(password) })
  }

  const handleLogin = () => {
    if (!password) return setError('أدخل كلمة المرور')
    if (atob(emp.password) !== password) return setError('كلمة المرور غير صحيحة')
    setError('')
    employeeLogin(emp)
  }

  const goBack = () => { setStep('select'); setError(''); setPass(''); setConf('') }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">

        {/* Logo */}
        <div className="flex justify-center">
          <img src={logoImg} alt="الشعار" className="h-24 object-contain" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-5">

          {/* ── اختيار الموظف ── */}
          {step === 'select' && (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto">
                  <UserCircle size={26} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">تسجيل الدخول</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">مكتب راكان للعقارات</p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}

              {employees.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4">لا يوجد موظفون مسجّلون، تواصل مع المالك.</p>
              ) : (
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputCls}>
                  <option value="">— اختر اسمك —</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} · {e.role}</option>
                  ))}
                </select>
              )}

              {employees.length > 0 && (
                <button onClick={handleNext} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                  التالي
                </button>
              )}

              <button onClick={() => navigate('/owner')} className="w-full py-2 text-sm text-gray-400 dark:text-gray-500 hover:underline">
                صاحب العمل؟ اضغط هنا
              </button>
            </>
          )}

          {/* ── تعيين كلمة مرور (أول مرة) ── */}
          {step === 'set_password' && (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto">
                  <KeyRound size={26} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">تعيين كلمة المرور</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">مرحباً {emp?.name}، حدد كلمة مرورك</p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPass(e.target.value)}
                    className={inputCls}
                    placeholder="كلمة المرور الجديدة"
                  />
                  <button onClick={() => setShow(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConf(e.target.value)}
                  className={inputCls}
                  placeholder="تأكيد كلمة المرور"
                  onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                />
              </div>

              <button onClick={handleSetPassword} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors">
                تعيين وتسجيل الدخول
              </button>
              <button onClick={goBack} className="w-full py-2 text-sm text-gray-400 dark:text-gray-500 hover:underline">رجوع</button>
            </>
          )}

          {/* ── إدخال كلمة المرور ── */}
          {step === 'enter_password' && (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/40 rounded-2xl flex items-center justify-center mx-auto">
                  <KeyRound size={26} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">أهلاً {emp?.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">أدخل كلمة مرورك للدخول</p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPass(e.target.value)}
                  className={inputCls}
                  placeholder="كلمة المرور"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button onClick={() => setShow(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button onClick={handleLogin} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                دخول
              </button>
              <button onClick={goBack} className="w-full py-2 text-sm text-gray-400 dark:text-gray-500 hover:underline">رجوع</button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
