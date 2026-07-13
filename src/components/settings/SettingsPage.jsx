import { useState, useEffect } from 'react'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { supabase } from '../../lib/supabase'
import { KeyRound, Mail, Trash2, Eye, EyeOff, Lock, Check, Settings, RefreshCw } from 'lucide-react'

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'

const fetchPin = async () => {
  const { data } = await supabase.from('settings').select('value').eq('key', 'owner_pin').single()
  return data?.value ? atob(data.value) : null
}
const savePin = async (p) => {
  await supabase.from('settings').upsert({ key: 'owner_pin', value: btoa(p) })
}
const fetchOwnerEmail = async () => {
  const { data } = await supabase.from('settings').select('value').eq('key', 'owner_email').single()
  return data?.value || null
}
const saveOwnerEmail = async (email) => {
  await supabase.from('settings').upsert({ key: 'owner_email', value: email })
}
const maskEmail = (email) => {
  if (!email) return ''
  const [user, domain] = email.split('@')
  return user.slice(0, 2) + '***@' + domain
}

export function SettingsPage() {
  const { isOwner, ownerLogout } = useOwnerSession()
  const [storedPin, setStoredPin]   = useState(null)
  const [currentEmail, setCurrentEmail] = useState('')

  // Password fields
  const [oldPass,  setOldPass]  = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [confPass, setConfPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSaved, setPassSaved] = useState(false)

  // Email field
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)

  // Delete
  const [deleteError, setDeleteError] = useState('')

  // OTP shared state — 'password' | 'email' | null
  const [otpStep,    setOtpStep]    = useState(null)
  const [otpCode,    setOtpCode]    = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpError,   setOtpError]   = useState('')

  useEffect(() => {
    if (!isOwner) return
    fetchPin().then(p => setStoredPin(p))
    fetchOwnerEmail().then(e => { setCurrentEmail(e || ''); setEmailInput(e || '') })
  }, [isOwner])

  /* ── إرسال OTP ── */
  const sendVerifyOtp = async (email) => {
    if (!email) return 'لا يوجد بريد إلكتروني'
    const { error } = await supabase.auth.signInWithOtp({ email })
    return error ? (error.message || 'فشل الإرسال') : null
  }

  /* ── التحقق ثم الحفظ ── */
  const handleVerifyAndSave = async () => {
    if (otpCode.length < 6) return setOtpError('أدخل الرمز كاملاً')
    const { error } = await supabase.auth.verifyOtp({ email: currentEmail, token: otpCode, type: 'email' })
    if (error) return setOtpError('الرمز غير صحيح أو انتهت صلاحيته')

    if (otpStep === 'password') {
      await savePin(newPass)
      setStoredPin(newPass)
      setOldPass(''); setNewPass(''); setConfPass('')
      setPassSaved(true)
      setTimeout(() => setPassSaved(false), 3000)
    } else if (otpStep === 'email') {
      const val = emailInput.trim().toLowerCase()
      await saveOwnerEmail(val)
      setCurrentEmail(val)
      setEmailSaved(true)
      setTimeout(() => setEmailSaved(false), 3000)
    }
    setOtpStep(null); setOtpCode(''); setOtpError('')
  }

  /* ── زر حفظ كلمة المرور ── */
  const handleSavePassword = async () => {
    setPassError('')
    if (oldPass !== storedPin) return setPassError('كلمة المرور الحالية غير صحيحة')
    if (newPass.length < 4)    return setPassError('4 أحرف على الأقل')
    if (newPass !== confPass)   return setPassError('كلمتا المرور غير متطابقتين')

    if (!currentEmail) {
      await savePin(newPass); setStoredPin(newPass)
      setOldPass(''); setNewPass(''); setConfPass('')
      setPassSaved(true); setTimeout(() => setPassSaved(false), 3000)
      return
    }
    setOtpSending(true)
    const err = await sendVerifyOtp(currentEmail)
    setOtpSending(false)
    if (err) return setPassError('فشل إرسال رمز التحقق: ' + err)
    setOtpStep('password'); setOtpCode(''); setOtpError('')
  }

  /* ── زر حفظ البريد ── */
  const handleSaveEmail = async () => {
    setEmailError('')
    const val = emailInput.trim().toLowerCase()
    if (!val.includes('@')) return setEmailError('البريد الإلكتروني غير صحيح')

    if (!currentEmail || val === currentEmail) {
      // لا يوجد إيميل حالي أو لم يتغير → احفظ مباشرة
      await saveOwnerEmail(val); setCurrentEmail(val)
      setEmailSaved(true); setTimeout(() => setEmailSaved(false), 3000)
      return
    }
    // إرسال OTP للإيميل الحالي للتحقق من هوية المالك قبل التغيير
    setOtpSending(true)
    const err = await sendVerifyOtp(currentEmail)
    setOtpSending(false)
    if (err) return setEmailError('فشل إرسال رمز التحقق: ' + err)
    setOtpStep('email'); setOtpCode(''); setOtpError('')
  }

  /* ── حقل OTP المشترك ── */
  const OtpBlock = ({ accent = 'blue' }) => {
    return (
      <div className={`space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700`}>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          تم إرسال رمز التحقق إلى بريدك الحالي{' '}
          <span className="font-medium" dir="ltr">{maskEmail(currentEmail)}</span>
        </div>
        {otpError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{otpError}</p>}
        <input
          type="text" inputMode="numeric" maxLength={8} value={otpCode}
          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
          className={`${inputCls} text-center text-xl font-bold tracking-[0.3em]`}
          placeholder="000000" dir="ltr" autoFocus
        />
        <div className="flex gap-2">
          <button onClick={handleVerifyAndSave}
            className={`flex-1 py-3 bg-${accent}-600 hover:bg-${accent}-700 text-white font-medium rounded-xl transition-colors`}>
            تحقق وحفظ
          </button>
          <button onClick={async () => {
            setOtpSending(true)
            await sendVerifyOtp(currentEmail)
            setOtpSending(false)
          }} disabled={otpSending}
            className="px-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <RefreshCw size={15} className={otpSending ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setOtpStep(null); setOtpCode(''); setOtpError('') }}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700">
            إلغاء
          </button>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Lock size={40} className="text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">ليس لديك صلاحية للوصول لهذه الصفحة</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Settings size={22} className="text-gray-600 dark:text-gray-400" />
          الإعدادات
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إعدادات حساب المالك</p>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <KeyRound size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">تغيير كلمة المرور</h3>
            <p className="text-xs text-gray-400">كلمة مرور صاحب العمل</p>
          </div>
        </div>
        {passError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{passError}</p>}
        {passSaved && (
          <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
            <Check size={14} /> تم حفظ كلمة المرور
          </p>
        )}
        {otpStep !== 'password' ? (
          <>
            <div className="space-y-3">
              <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)}
                className={inputCls} placeholder="كلمة المرور الحالية" />
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                  className={inputCls} placeholder="كلمة المرور الجديدة" />
                <button onClick={() => setShowPass(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input type="password" value={confPass} onChange={e => setConfPass(e.target.value)}
                className={inputCls} placeholder="تأكيد كلمة المرور الجديدة" />
            </div>
            <button onClick={handleSavePassword} disabled={otpSending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
              {otpSending ? 'جاري الإرسال...' : 'حفظ كلمة المرور'}
            </button>
          </>
        ) : (
          <OtpBlock accent="blue" />
        )}
      </div>

      {/* Update Email / OTP */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Mail size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">البريد الإلكتروني / OTP</h3>
            {currentEmail && <p className="text-xs text-gray-400" dir="ltr">{maskEmail(currentEmail)}</p>}
          </div>
        </div>
        {emailError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{emailError}</p>}
        {emailSaved && (
          <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
            <Check size={14} /> تم حفظ البريد الإلكتروني
          </p>
        )}
        {otpStep !== 'email' ? (
          <>
            <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)}
              className={inputCls} placeholder="example@gmail.com" dir="ltr" />
            <button onClick={handleSaveEmail} disabled={otpSending}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
              {otpSending ? 'جاري الإرسال...' : 'حفظ البريد'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 px-3 py-2 rounded-lg" dir="ltr">
              → {emailInput.trim().toLowerCase()}
            </p>
            <OtpBlock accent="purple" />
          </>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-800/30 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Trash2 size={18} className="text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-red-600 dark:text-red-400">حذف حساب المالك</h3>
            <p className="text-xs text-gray-400">لا يمكن التراجع عن هذا الإجراء</p>
          </div>
        </div>
        {deleteError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{deleteError}</p>}
        <button onClick={async () => {
          if (!window.confirm('سيتم حذف بيانات المالك نهائياً. هل أنت متأكد؟')) return
          try {
            await supabase.from('settings').delete().in('key', ['owner_pin', 'owner_session_token', 'owner_name', 'owner_email'])
            ownerLogout()
          } catch (e) { setDeleteError('فشل الحذف: ' + (e.message || '')) }
        }} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors">
          حذف حساب المالك
        </button>
      </div>
    </div>
  )
}
