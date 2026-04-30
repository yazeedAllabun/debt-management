import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import { calcProfit, formatCurrency, toEnDigits } from '../../utils/formatters'
import { MultiSelect } from '../ui/MultiSelect'
import { CheckCircle, AlertCircle, Calculator } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useOwnerSession } from '../../context/OwnerSessionContext'
import { useEmployeeSession } from '../../context/EmployeeSessionContext'

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

export function AddClientPage() {
  const { addClient } = useClients()
  const navigate = useNavigate()
  const location = useLocation()
  const { isOwner } = useOwnerSession()
  const { currentEmployee } = useEmployeeSession()
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedBanks, setSelectedBanks] = useState([])
  const [selectedFinancing, setSelectedFinancing] = useState([])
  const [employees, setEmployees] = useState([])

  const fromCalc = location.state?.fromCalc

  useEffect(() => {
    if (!isOwner) return
    supabase.from('employees').select('id, name, role').order('name')
      .then(({ data }) => setEmployees(data || []))
  }, [isOwner])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      payment_status: 'pending',
      financing_status: 'pending',
      commission_pct: 10,
      name: fromCalc?.name || '',
      phone: fromCalc?.phone || '',
      debt_amount: fromCalc?.debt_amount || '',
    },
  })

  const debtAmount    = parseFloat(watch('debt_amount')) || 0
  const commissionPct = parseFloat(watch('commission_pct')) || 0
  const previewProfit = calcProfit(debtAmount, commissionPct)

  const saveClient = async (data) => {
    await addClient({
      name:               data.name.trim(),
      phone:              data.phone?.trim() || null,
      bank_names:         selectedBanks,
      financing_companies: selectedFinancing,
      added_by:           isOwner ? (data.added_by || null) : (currentEmployee?.name || null),
      debt_amount:        parseFloat(data.debt_amount),
      commission_pct:     parseFloat(data.commission_pct),
      payment_status:     data.payment_status,
      financing_status:   data.financing_status,
      notes:              data.notes?.trim() || null,
    })
    reset()
    setSelectedBanks([])
    setSelectedFinancing([])
  }

  const onSave = async (data) => {
    setSubmitStatus(null)
    try {
      await saveClient(data)
      setSubmitStatus('success')
      setTimeout(() => navigate('/clients'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
      setSubmitStatus('error')
    }
  }

  const onSaveAndCalculate = async (data) => {
    setSubmitStatus(null)
    try {
      await saveClient(data)
      navigate('/muhtasib', { state: { client: { name: data.name.trim(), phone: data.phone?.trim() || '' } } })
    } catch (err) {
      setErrorMsg(err.message)
      setSubmitStatus('error')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">إضافة عميل جديد</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">يتم الحفظ في قاعدة البيانات</p>
      </div>

      {fromCalc && (
        <div className="mb-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm">
          ✓ تم استيراد البيانات من الحسبة — راجع الحقول قبل الحفظ
        </div>
      )}

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

      <form className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">

        {/* البيانات الشخصية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="اسم العميل *" error={errors.name?.message}>
            <input
              {...register('name', { required: 'الاسم مطلوب' })}
              className={inputCls}
              placeholder="محمد أحمد العتيبي"
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
              placeholder="05xxxxxxxx"
              maxLength={10}
              onInput={e => { e.target.value = toEnDigits(e.target.value) }}
            />
          </Field>
        </div>

        {/* الموظف المسؤول — للمالك فقط */}
        {isOwner && employees.length > 0 && (
          <Field label="أضيف بواسطة">
            <select {...register('added_by')} className={inputCls}>
              <option value="">— اختر الموظف —</option>
              {employees.map(e => (
                <option key={e.id} value={e.name}>{e.name} ({e.role})</option>
              ))}
            </select>
          </Field>
        )}

        {/* البنوك وشركات التمويل */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="البنوك">
            <MultiSelect
              options={BANKS}
              selected={selectedBanks}
              onChange={setSelectedBanks}
              placeholder="اختر البنك..."
            />
          </Field>

          <Field label="شركة التمويل">
            <MultiSelect
              options={FINANCING_COMPANIES}
              selected={selectedFinancing}
              onChange={setSelectedFinancing}
              placeholder="اختر شركة التمويل..."
            />
          </Field>
        </div>

        {/* البيانات المالية */}
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
              placeholder="0"
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
              placeholder="10"
              step="0.01"
            />
          </Field>
        </div>

        {/* معاينة الربح */}
        {debtAmount > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">الربح المتوقع</span>
            <span className="text-lg font-bold text-green-700 dark:text-green-400">
              {formatCurrency(previewProfit)}
            </span>
          </div>
        )}

        {/* الإجراءات */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">الإجراءات</p>
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
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSaveAndCalculate)}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Calculator size={16} />
            حفظ واحتساب
          </button>
          <button
            type="button"
            onClick={() => { reset(); setSelectedBanks([]); setSelectedFinancing([]); navigate(-1) }}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
