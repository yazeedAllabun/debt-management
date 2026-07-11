import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserCircle, KeyRound, Mail, RefreshCw } from 'lucide-react'
import { useEmployeeSession } from '../../context/EmployeeSessionContext'
import { supabase } from '../../lib/supabase'
import logoImg from '../../assets/logo-dark.png'

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'

const maskEmail = (email) => {
  const [user, domain] = email.split('@')
  return user.slice(0, 2) + '***@' + domain
}

export function EmployeeLogin() {
  const navigate = useNavigate()
  const { employeeLogin } = useEmployeeSession()

  const [employees, setEmployees] = useState([])
  const [loadingEmps, setLoadingEmps] = useState(true)
  const [selectedId, setSelectedId]   = useState('')
  const [step, setStep]   = useState('select') // 'select' | 'set_password' | 'enter_password' | 'otp_verify' | 'forgot_otp' | 'reset_password'
  const [password, setPass] = useState('')
  const [confirm, setConf]  = useState('')
  const [showPass, setShow] = useState(false)
  const [error, setError]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [otpCode, setOtpCode]       = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpEmail, setOtpEmail]     = useState('')
  const [pendingEmp, setPendingEmp] = useState(null)

  useEffect(() => {
    supabase.from('employees').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setEmployees(data || []); setLoadingEmps(false) })
  }, [])

  const emp = employees.find(e => e.id === selectedId)

  const handleNext = () => {
    if (!selectedId) return setError('اختر اسمك من القائمة')
    setError(''); setPass(''); setConf('')
    setStep(emp.password ? 'enter_password' : 'set_password')
  }

  const sendOtpToEmployee = async (employee) => {
    if (!employee.email) return { email: null, error: null }
    const email = employee.email.trim().toLowerCase()
    const { error } = await supabase.functions.invoke('send-otp', {
      body: { employee_id: employee.id, email },
    })
    return { email: error ? null : email, error: error || null }
  }

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) return setError('أدخل الرمز كاملاً')
    setSubmitting(true)
    const { data, error } = await supabase
      .from('employees')
      .select('otp_code, otp_expires_at')
      .eq('id', pendingEmp.id)
      .single()
    if (error || !data?.otp_code) { setSubmitting(false); return setError('حدث خطأ، حاول مجدداً') }
    if (data.otp_code !== otpCode) { setSubmitting(false); return setError('الرمز غير صحيح') }
    if (new Date(data.otp_expires_at) < new Date()) { setSubmitting(false); return setError('انتهت صلاحية الرمز، اطلب رمزاً جديداً') }
    // Clear OTP after successful verification
    await supabase.from('employees').update({ otp_code: null, otp_expires_at: null }).eq('id', pendingEmp.id)
    await employeeLogin(pendingEmp)
    setSubmitting(false)
  }

  const handleSetPassword = async () => {
    if (password.length < 4) return setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل')
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين')
    setSubmitting(true)
    const encoded = btoa(password)
    const { data, error } = await supabase
      .from('employees')
      .update({ password: encoded })
      .eq('id', emp.id)
      .select()
      .single()
    if (error) { setSubmitting(false); return setError('حدث خطأ، حاول مجدداً') }

    if (data.email) {
      setOtpSending(true)
      const { email, error: otpErr } = await sendOtpToEmployee(data)
      setOtpSending(false)
      if (otpErr) { setSubmitting(false); return setError(`فشل إرسال رمز التحقق: ${otpErr.message}`) }
      if (email) {
        setPendingEmp(data); setOtpEmail(email); setOtpCode('')
        setError(''); setSubmitting(false); setStep('otp_verify'); return
      }
    }
    await employeeLogin(data)
    setSubmitting(false)
  }

  const handleLogin = async () => {
    if (!password) return setError('أدخل كلمة المرور')
    if (atob(emp.password) !== password) return setError('كلمة المرور غير صحيحة')
    setError('')
    if (emp.email) {
      setSubmitting(true)
      const { email, error: otpErr } = await sendOtpToEmployee(emp)
      setSubmitting(false)
      if (otpErr) return setError(`فشل إرسال رمز التحقق: ${otpErr.message}`)
      if (email) {
        setPendingEmp(emp); setOtpEmail(email); setOtpCode(''); setStep('otp_verify'); return
      }
    }
    setSubmitting(true)
    await employeeLogin(emp)
    setSubmitting(false)
  }

  const goBack = () => { setStep('select'); setError(''); setPass(''); setConf('') }

  const handleForgotPassword = async () => {
    if (!emp?.email) {
      setError('لا يوجد بريد إلكتروني مسجّل — تواصل مع المالك لإعادة تعيين كلمة المرور')
      return
    }
    setSubmitting(true)
    const { email, error: otpErr } = await sendOtpToEmployee(emp)
    setSubmitting(false)
    if (otpErr) return setError(`فشل إرسال رمز التحقق: ${otpErr.message}`)
    if (!email) return setError('فشل إرسال رمز التحقق، حاول مجدداً')
    setPendingEmp(emp); setOtpEmail(email); setOtpCode(''); setError(''); setStep('forgot_otp')
  }

  const handleForgotOtpVerify = async () => {
    if (otpCode.length < 6) return setError('أدخل الرمز كاملاً')
    setSubmitting(true)
    const { data, error } = await supabase
      .from('employees')
      .select('otp_code, otp_expires_at')
      .eq('id', pendingEmp.id)
      .single()
    setSubmitting(false)
    if (error || !data?.otp_code) return setError('حدث خطأ، حاول مجدداً')
    if (data.otp_code !== otpCode) return setError('الرمز غير صحيح')
    if (new Date(data.otp_expires_at) < new Date()) return setError('انتهت صلاحية الرمز، اطلب رمزاً جديداً')
    await supabase.from('employees').update({ otp_code: null, otp_expires_at: null }).eq('id', pendingEmp.id)
    setError(''); setPass(''); setConf(''); setStep('reset_password')
  }

  const handleResetPassword = async () => {
    if (password.length < 4) return setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل')
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين')
    setSubmitting(true)
    const { data, error } = await supabase
      .from('employees')
      .update({ password: btoa(password) })
      .eq('id', pendingEmp.id)
      .select()
      .single()
    if (error) { setSubmitting(false); return setError('حدث خطأ، حاول مجدداً') }
    await employeeLogin(data)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">

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
                <p className="text-sm text-gray-500 dark:text-gray-400">راكان للتمويل</p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}

              {loadingEmps ? (
                <p className="text-center text-sm text-gray-400 py-4">جاري التحميل...</p>
              ) : employees.length === 0 ? (
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
                <button onClick={handleNext}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                  التالي
                </button>
              )}

              <button onClick={() => navigate('/owner')}
                className="w-full py-2 text-sm text-gray-400 dark:text-gray-500 hover:underline">
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
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)}
                    className={inputCls} placeholder="كلمة المرور الجديدة" />
                  <button onClick={() => setShow(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input type="password" value={confirm} onChange={e => setConf(e.target.value)}
                  className={inputCls} placeholder="تأكيد كلمة المرور"
                  onKeyDown={e => e.key === 'Enter' && handleSetPassword()} />
              </div>

              <button onClick={handleSetPassword} disabled={submitting || otpSending}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
                {submitting || otpSending ? 'جاري الإرسال...' : 'تعيين وتسجيل الدخول'}
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
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)}
                  className={inputCls} placeholder="كلمة المرور"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShow(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button onClick={handleLogin} disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
                {submitting ? 'جاري الإرسال...' : 'دخول'}
              </button>
              <button onClick={handleForgotPassword} disabled={submitting}
                className="w-full py-1.5 text-sm text-blue-500 dark:text-blue-400 hover:underline disabled:opacity-50">
                نسيت كلمة المرور؟
              </button>
              <button onClick={goBack} className="w-full py-2 text-sm text-gray-400 dark:text-gray-500 hover:underline">رجوع</button>
            </>
          )}

          {/* ── نسيت كلمة المرور — OTP ── */}
          {step === 'forgot_otp' && (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center mx-auto">
                  <Mail size={26} className="text-orange-500 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">استعادة كلمة المرور</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">تم إرسال رمز 6 أرقام إلى</p>
                <p className="text-sm font-medium text-orange-500 dark:text-orange-400" dir="ltr">
                  {maskEmail(otpEmail)}
                </p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}

              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className={`${inputCls} text-center text-2xl font-bold tracking-[0.3em]`}
                placeholder="00000000"
                dir="ltr"
                autoFocus
              />

              <button onClick={handleForgotOtpVerify} disabled={submitting}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
                {submitting ? 'جاري التحقق...' : 'تحقق'}
              </button>

              <button onClick={async () => {
                setError(''); setOtpSending(true)
                const { error: otpErr } = await sendOtpToEmployee(pendingEmp)
                setOtpSending(false)
                if (otpErr) setError(`فشل الإرسال: ${otpErr.message}`)
              }} disabled={otpSending}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-orange-500 dark:text-orange-400 hover:underline disabled:opacity-50">
                <RefreshCw size={13} className={otpSending ? 'animate-spin' : ''} />
                {otpSending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
              </button>

              <button onClick={() => { setStep('enter_password'); setOtpCode(''); setError('') }}
                className="w-full py-1.5 text-sm text-gray-400 dark:text-gray-500 hover:underline">رجوع</button>
            </>
          )}

          {/* ── إعادة تعيين كلمة المرور بعد OTP ── */}
          {step === 'reset_password' && (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto">
                  <KeyRound size={26} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">كلمة مرور جديدة</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">تم التحقق — اختر كلمة مرور جديدة</p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}

              <div className="space-y-3">
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)}
                    className={inputCls} placeholder="كلمة المرور الجديدة" />
                  <button onClick={() => setShow(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input type="password" value={confirm} onChange={e => setConf(e.target.value)}
                  className={inputCls} placeholder="تأكيد كلمة المرور"
                  onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
              </div>

              <button onClick={handleResetPassword} disabled={submitting}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
                {submitting ? 'جاري الحفظ...' : 'حفظ وتسجيل الدخول'}
              </button>
            </>
          )}

          {/* ── التحقق بـ OTP ── */}
          {step === 'otp_verify' && (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mx-auto">
                  <Mail size={26} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">رمز التحقق</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">تم إرسال رمز 6 أرقام إلى</p>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400" dir="ltr">
                  {maskEmail(otpEmail)}
                </p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">{error}</p>}

              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className={`${inputCls} text-center text-2xl font-bold tracking-[0.3em]`}
                placeholder="00000000"
                dir="ltr"
                autoFocus
              />

              <button onClick={handleVerifyOtp} disabled={submitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
                {submitting ? 'جاري التحقق...' : 'تحقق وادخل'}
              </button>

              <button onClick={async () => {
                setError(''); setOtpSending(true)
                const { error: otpErr } = await sendOtpToEmployee(pendingEmp)
                setOtpSending(false)
                if (otpErr) setError(`فشل الإرسال: ${otpErr.message}`)
              }} disabled={otpSending}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-purple-500 dark:text-purple-400 hover:underline disabled:opacity-50">
                <RefreshCw size={13} className={otpSending ? 'animate-spin' : ''} />
                {otpSending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
              </button>

              <button onClick={goBack} className="w-full py-1.5 text-sm text-gray-400 dark:text-gray-500 hover:underline">
                رجوع
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
