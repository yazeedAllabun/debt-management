import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import { calcProfit, formatCurrency } from '../../utils/formatters'
import { CheckCircle, AlertCircle } from 'lucide-react'

const BANKS = [
  'الراجحي', 'الأهلي', 'سامبا', 'الرياض', 'البلاد', 'الإنماء',
  'العربي الوطني', 'السعودي الفرنسي', 'البريد', 'اليمامة', 'الجزيرة', 'أخرى',
]

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'

export function AddClientPage() {
  const { addClient } = useClients()
  const navigate = useNavigate()
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      status: 'pending',
      commission_pct: 10,
      debt_amount: '',
      paid_amount: '',
    },
  })

  const debtAmount = parseFloat(watch('debt_amount')) || 0
  const paidAmount = parseFloat(watch('paid_amount')) || 0
  const commissionPct = parseFloat(watch('commission_pct')) || 0
  const previewProfit = calcProfit(debtAmount, paidAmount, commissionPct)

  const onSubmit = async (data) => {
    setSubmitStatus(null)
    try {
      await addClient({
        name: data.name.trim(),
        national_id: data.national_id.trim(),
        phone: data.phone?.trim() || null,
        bank_name: data.bank_name || null,
        debt_amount: parseFloat(data.debt_amount),
        paid_amount: parseFloat(data.paid_amount),
        commission_pct: parseFloat(data.commission_pct),
        status: data.status,
        notes: data.notes?.trim() || null,
      })
      setSubmitStatus('success')
      reset()
      setTimeout(() => navigate('/clients'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
      setSubmitStatus('error')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">إضافة عميل جديد</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">يتم الحفظ تلقائياً في قاعدة البيانات</p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl">
          <CheckCircle size={18} />
          تم إضافة العميل بنجاح! جاري التحويل...
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl">
          <AlertCircle size={18} />
          خطأ: {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="اسم العميل *" error={errors.name?.message}>
            <input
              {...register('name', { required: 'الاسم مطلوب' })}
              className={inputCls}
              placeholder="محمد أحمد العتيبي"
            />
          </Field>

          <Field label="رقم الهوية الوطنية *" error={errors.national_id?.message}>
            <input
              {...register('national_id', {
                required: 'رقم الهوية مطلوب',
                pattern: { value: /^[12]\d{9}$/, message: 'رقم هوية غير صحيح (10 أرقام)' },
              })}
              className={inputCls}
              placeholder="1xxxxxxxxx"
              maxLength={10}
            />
          </Field>

          <Field label="رقم الجوال" error={errors.phone?.message}>
            <input
              {...register('phone', {
                pattern: { value: /^05\d{8}$/, message: 'رقم جوال غير صحيح (05xxxxxxxx)' },
              })}
              className={inputCls}
              placeholder="05xxxxxxxx"
              maxLength={10}
            />
          </Field>

          <Field label="البنك" error={errors.bank_name?.message}>
            <select {...register('bank_name')} className={inputCls}>
              <option value="">اختر البنك</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="مبلغ الدين (ر.س) *" error={errors.debt_amount?.message}>
            <input
              type="number"
              {...register('debt_amount', {
                required: 'مبلغ الدين مطلوب',
                min: { value: 1, message: 'يجب أن يكون أكبر من صفر' },
              })}
              className={inputCls}
              placeholder="0"
              step="0.01"
            />
          </Field>

          <Field label="المبلغ المدفوع (ر.س) *" error={errors.paid_amount?.message}>
            <input
              type="number"
              {...register('paid_amount', {
                required: 'المبلغ المدفوع مطلوب',
                min: { value: 0, message: 'لا يمكن أن يكون سالباً' },
              })}
              className={inputCls}
              placeholder="0"
              step="0.01"
            />
          </Field>

          <Field label="نسبة العمولة % *" error={errors.commission_pct?.message}>
            <input
              type="number"
              {...register('commission_pct', {
                required: 'نسبة العمولة مطلوبة',
                min: { value: 0, message: 'يجب أن تكون 0 أو أكثر' },
                max: { value: 100, message: 'لا تتجاوز 100%' },
              })}
              className={inputCls}
              placeholder="10"
              step="0.01"
            />
          </Field>
        </div>

        {/* Profit preview */}
        {(debtAmount > 0 || paidAmount > 0) && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">الربح المتوقع</span>
            <span className="text-lg font-bold text-green-700 dark:text-green-400">
              {formatCurrency(previewProfit)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="الحالة">
            <select {...register('status')} className={inputCls}>
              <option value="pending">معلق</option>
              <option value="paid">مكتمل</option>
            </select>
          </Field>
        </div>

        <Field label="ملاحظات" error={errors.notes?.message}>
          <textarea
            {...register('notes')}
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="أي ملاحظات إضافية..."
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ العميل'}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            مسح
          </button>
        </div>
      </form>
    </div>
  )
}
