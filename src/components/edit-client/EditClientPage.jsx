import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useClients } from '../../hooks/useClients'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { useEmployeeSession } from '../../context/EmployeeSessionContext'
import { MultiSelect } from '../ui/MultiSelect'
import { Badge } from '../ui/Badge'
import { calcProfit, formatCurrency, toEnDigits } from '../../utils/formatters'

const BANKS = [
  'الراجحي', 'الأهلي', 'الرياض', 'البلاد', 'الإنماء',
  'العربي الوطني', 'السعودي الفرنسي', 'الجزيرة', 'الإمارات دبي الوطني', 'أخرى',
]

const FINANCING_COMPANIES = [
  'تمام', 'نايفات', 'سهل', 'كوارا', 'عبداللطيف جميل للتمويل',
  'الوطنية للتمويل', 'التيسير', 'تسهيل', 'أملاك', 'اليسر للتمويل',
  'الرائدة للتمويل', 'الخليج للتمويل', 'باب رزق جميل', 'أصول الحديثة للتمويل',
  'ليندو', 'آجل', 'سلفة', 'الأمثل للتمويل', 'الجاسرية للتمويل',
  'رايه للتمويل', 'فينزي', 'أريب', 'أخرى',
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

export function EditClientPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateClientStatus } = useClients()
  const { isOwner } = useOwnerSession()
  const { currentEmployee } = useEmployeeSession()

  const [client, setClient] = useState(null)
  const [loadingClient, setLoadingClient] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedBanks, setSelectedBanks] = useState([])
  const [selectedFinancing, setSelectedFinancing] = useState([])
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    supabase.from('clients').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setLoadError('تعذّر تحميل بيانات العميل'); setLoadingClient(false); return }
        setClient(data)
        setSelectedBanks(Array.isArray(data.bank_names) ? data.bank_names : (data.bank_name ? [data.bank_name] : []))
        setSelectedFinancing(Array.isArray(data.financing_companies) ? data.financing_companies : [])
        reset({
          name: data.name || '',
          phone: data.phone || '',
          debt_amount: data.debt_amount || '',
          commission_pct: data.commission_pct ?? 10,
          payment_status: data.payment_status || 'pending',
          financing_status: data.financing_status || 'pending',
          notes: data.notes || '',
        })
        setLoadingClient(false)
      })
  }, [id, reset])

  const debtAmount = parseFloat(watch('debt_amount')) || 0
  const commissionPct = parseFloat(watch('commission_pct')) || 0
  const previewProfit = calcProfit(debtAmount, commissionPct)

  const ALL_PERMISSIONS = ['view_dashboard', 'view_clients', 'add_clients', 'delete_clients', 'view_reports', 'export_excel']
  const canEditStatus = isOwner
    || (client && currentEmployee?.name && client.added_by === currentEmployee.name)
    || (currentEmployee?.permissions && ALL_PERMISSIONS.every(p => currentEmployee.permissions.includes(p)))

  const onSave = async (data) => {
    setSubmitStatus(null)
    try {
      await updateClientStatus(id, {
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        bank_names: selectedBanks,
        financing_companies: selectedFinancing,
        debt_amount: parseFloat(data.debt_amount),
        commission_pct: parseFloat(data.commission_pct),
        payment_status: data.payment_status,
        financing_status: data.financing_status,
        notes: data.notes?.trim() || null,
      })
      setSubmitStatus('success')
      setTimeout(() => navigate(-1), 1200)
    } catch (err) {
      setErrorMsg(err.message)
      setSubmitStatus('error')
    }
  }

  if (loadingClient) {
    return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
  }
  if (loadError) {
    return <div className="text-center py-20 text-red-500">{loadError}</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
          <ArrowRight size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">تعديل ملف العميل</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{client?.name}</p>
        </div>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl">
          <CheckCircle size={18} />
          تم حفظ التعديلات بنجاح!
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl">
          <AlertCircle size={18} />
          خطأ: {errorMsg}
        </div>
      )}

      <form className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="اسم العميل *" error={errors.name?.message}>
            <input
              {...register('name', { required: 'الاسم مطلوب' })}
              className={inputCls}
            />
          </Field>
          <Field label="رقم الجوال *" error={errors.phone?.message}>
            <input
              {...register('phone', {
                required: 'رقم الجوال مطلوب',
                pattern: { value: /^05\d{8}$/, message: 'رقم جوال غير صحيح (05xxxxxxxx)' },
                setValueAs: toEnDigits,
              })}
              className={inputCls}
              maxLength={10}
              onInput={e => { e.target.value = toEnDigits(e.target.value) }}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="البنوك">
            <MultiSelect options={BANKS} selected={selectedBanks} onChange={setSelectedBanks} placeholder="اختر البنك..." />
          </Field>
          <Field label="شركة التمويل">
            <MultiSelect options={FINANCING_COMPANIES} selected={selectedFinancing} onChange={setSelectedFinancing} placeholder="اختر شركة التمويل..." />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="مبلغ التسوية (ر.س) *" error={errors.debt_amount?.message}>
            <input
              type="number"
              {...register('debt_amount', {
                required: 'المبلغ مطلوب',
                min: { value: 1, message: 'يجب أن يكون أكبر من صفر' },
                setValueAs: v => parseFloat(toEnDigits(v)) || '',
              })}
              className={inputCls}
              step="0.01"
              onInput={e => { e.target.value = toEnDigits(e.target.value) }}
            />
          </Field>
          <Field label="نسبة العمولة % *" error={errors.commission_pct?.message}>
            <input
              type="number"
              {...register('commission_pct', {
                required: 'نسبة العمولة مطلوبة',
                min: { value: 0, message: '0 أو أكثر' },
                max: { value: 100, message: 'لا تتجاوز 100%' },
              })}
              className={inputCls}
              step="0.01"
            />
          </Field>
        </div>

        {debtAmount > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">الربح المتوقع</span>
            <span className="text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(previewProfit)}</span>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">الإجراءات</p>
          {canEditStatus ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="إجراءات السداد">
                <select {...register('payment_status')} className={inputCls}>
                  <option value="pending">لم يتم السداد</option>
                  <option value="under_review">تحت الدراسة</option>
                  <option value="request_created">إنشاء طلب</option>
                  <option value="paid">تم السداد</option>
                </select>
              </Field>
              <Field label="إجراءات التمويل">
                <select {...register('financing_status')} className={inputCls}>
                  <option value="pending">بانتظار السداد</option>
                  <option value="under_review">تحت الدراسة</option>
                  <option value="request_created">إنشاء طلب</option>
                  <option value="approved">تم التمويل</option>
                </select>
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">إجراءات السداد</p>
                <Badge status={client?.payment_status} type="payment" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">إجراءات التمويل</p>
                <Badge status={client?.financing_status} type="financing" />
              </div>
            </div>
          )}
        </div>

        <Field label="ملاحظات">
          <textarea
            {...register('notes')}
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="أي ملاحظات إضافية..."
          />
        </Field>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit(onSave)}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
