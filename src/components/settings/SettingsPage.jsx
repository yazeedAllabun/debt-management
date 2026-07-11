import { useState, useEffect } from 'react'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { supabase } from '../../lib/supabase'
import { KeyRound, Mail, Trash2, Eye, EyeOff, Lock, Check, Settings } from 'lucide-react'

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
  const [user, domain] = email.split('@')
  return user.slice(0, 2) + '***@' + domain
}

export function SettingsPage() {
  const { isOwner, ownerLogout } = useOwnerSession()
  const [storedPin, setStoredPin] = useState(null)
  const [currentEmail, setCurrentEmail] = useState('')

  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSaved, setPassSaved] = useState(false)

  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!isOwner) return
    fetchPin().then(p => setStoredPin(p))
    fetchOwnerEmail().then(e => { setCurrentEmail(e || ''); setEmailInput(e || '') })
  }, [isOwner])

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
        <button onClick={async () => {
          setPassError('')
          if (oldPass !== storedPin) return setPassError('كلمة المرور الحالية غير صحيحة')
          if (newPass.length < 4) return setPassError('4 أحرف على الأقل')
          if (newPass !== confPass) return setPassError('كلمتا المرور غير متطابقتين')
          await savePin(newPass)
          setStoredPin(newPass)
          setOldPass(''); setNewPass(''); setConfPass('')
          setPassSaved(true)
          setTimeout(() => setPassSaved(false), 3000)
        }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
          حفظ كلمة المرور
        </button>
      </div>

      {/* Update Email / OTP */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Mail size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">البريد الإلكتروني / OTP</h3>
            {currentEmail && (
              <p className="text-xs text-gray-400" dir="ltr">{maskEmail(currentEmail)}</p>
            )}
          </div>
        </div>
        {emailError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{emailError}</p>}
        {emailSaved && (
          <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
            <Check size={14} /> تم حفظ البريد الإلكتروني
          </p>
        )}
        <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)}
          className={inputCls} placeholder="example@gmail.com" dir="ltr" />
        <button onClick={async () => {
          setEmailError('')
          if (!emailInput.includes('@')) return setEmailError('البريد الإلكتروني غير صحيح')
          await saveOwnerEmail(emailInput.trim().toLowerCase())
          setCurrentEmail(emailInput.trim().toLowerCase())
          setEmailSaved(true)
          setTimeout(() => setEmailSaved(false), 3000)
        }} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
          حفظ البريد
        </button>
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
