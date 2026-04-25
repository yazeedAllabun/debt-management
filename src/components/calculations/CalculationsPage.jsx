import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Calculator, User, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useCalculations } from '../../hooks/useCalculations'

function buildPrintNode(calc, dateStr) {
  const typeLabel = calc.calc_type === 'personal' ? 'التمويل الشخصي' : 'شركات التمويل'
  const rows = Object.entries(calc.result || {})
    .map(([k, v]) => `<tr><td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px">${k}</td><td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1d4ed8;font-size:14px;text-align:left">${v}</td></tr>`)
    .join('')

  const inputRows = [
    calc.inputs?.salary ? `<span style="background:#f3f4f6;border-radius:6px;padding:4px 10px;font-size:12px;color:#6b7280">الراتب: ${Number(calc.inputs.salary).toLocaleString('ar-SA')} ر.س</span>` : '',
    calc.inputs?.months ? `<span style="background:#f3f4f6;border-radius:6px;padding:4px 10px;font-size:12px;color:#6b7280">المدة: ${calc.inputs.months} شهر</span>` : '',
    calc.inputs?.rate   ? `<span style="background:#f3f4f6;border-radius:6px;padding:4px 10px;font-size:12px;color:#6b7280">الفائدة: ${calc.inputs.rate}%</span>` : '',
    calc.inputs?.payoff && Number(calc.inputs.payoff) > 0 ? `<span style="background:#f3f4f6;border-radius:6px;padding:4px 10px;font-size:12px;color:#6b7280">مبلغ السداد: ${Number(calc.inputs.payoff).toLocaleString('ar-SA')} ر.س</span>` : '',
  ].filter(Boolean).join(' ')

  const node = document.createElement('div')
  node.style.cssText = 'position:fixed;left:-9999px;top:0;direction:rtl;font-family:Tajawal,Arial,sans-serif;background:#fff;padding:32px;width:520px;border-radius:16px'
  node.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #e5e7eb">
      <div>
        <div style="font-size:20px;font-weight:800;color:#1e293b">حسبة ${typeLabel}</div>
        <div style="font-size:13px;color:#94a3b8;margin-top:4px">${dateStr}</div>
      </div>
      <span style="background:${calc.calc_type === 'personal' ? '#eef2ff' : '#ecfdf5'};color:${calc.calc_type === 'personal' ? '#4f46e5' : '#059669'};font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px">${typeLabel}</span>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;color:#1e293b">${calc.client_name}</div>
      ${calc.client_phone ? `<div style="font-size:13px;color:#94a3b8;margin-top:2px">${calc.client_phone}</div>` : ''}
    </div>
    ${inputRows ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">${inputRows}</div>` : ''}
    <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
      <thead><tr style="background:#f8fafc">
        <th style="padding:10px 14px;text-align:right;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e5e7eb">البند</th>
        <th style="padding:10px 14px;text-align:left;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e5e7eb">القيمة</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:16px;font-size:11px;color:#cbd5e1;text-align:center">حسبة مبدئية — يرجى التحقق مع الجهة التمويلية</div>
  `
  return node
}

export function CalculationsPage() {
  const { calculations, loading, deleteCalculation } = useCalculations()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [deleting, setDeleting] = useState(null)
  const [downloading, setDownloading] = useState(null)

  const filtered = calculations.filter(c => {
    const matchSearch = !search.trim() || c.client_name.includes(search) || (c.client_phone || '').includes(search)
    const matchType = filterType === 'all' || c.calc_type === filterType
    return matchSearch && matchType
  })

  async function handleDelete(id) {
    if (!confirm('حذف هذه الحسبة؟')) return
    setDeleting(id)
    try { await deleteCalculation(id) } finally { setDeleting(null) }
  }

  async function handleDownload(calc) {
    setDownloading(calc.id)
    const node = buildPrintNode(calc, formatDate(calc.created_at))
    document.body.appendChild(node)
    try {
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = `حسبة-${calc.client_name}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      node.remove()
      setDownloading(null)
    }
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">الحسبات المحفوظة</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{calculations.length} حسبة محفوظة</p>
        </div>
        <button
          onClick={() => navigate('/claude-calculator')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Calculator size={16} />
          حسبة جديدة
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="ابحث باسم العميل أو الجوال..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">كل الأنواع</option>
          <option value="personal">التمويل الشخصي</option>
          <option value="finco">شركات التمويل</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Calculator size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search || filterType !== 'all' ? 'لا توجد نتائج' : 'لا توجد حسبات محفوظة بعد'}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(calc => (
            <div key={calc.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <User size={15} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{calc.client_name}</p>
                    {calc.client_phone && <p className="text-xs text-gray-400">{calc.client_phone}</p>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  calc.calc_type === 'personal'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {calc.calc_type === 'personal' ? 'شخصي' : 'شركات تمويل'}
                </span>
              </div>

              {/* Key results */}
              <div className="grid grid-cols-2 gap-2">
                {calc.result?.['صافي مبلغ التمويل'] && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">صافي التمويل</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {calc.result['صافي مبلغ التمويل']}
                    </p>
                  </div>
                )}
                {calc.result?.['القسط الشهري'] && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">القسط الشهري</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {calc.result['القسط الشهري']}
                    </p>
                  </div>
                )}
              </div>

              {/* Inputs summary */}
              <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                {calc.inputs?.salary && <span>الراتب: {Number(calc.inputs.salary).toLocaleString('ar-SA')} ر</span>}
                {calc.inputs?.months && <span>المدة: {calc.inputs.months} شهر</span>}
                {calc.inputs?.rate && <span>الفائدة: {calc.inputs.rate}%</span>}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400">{formatDate(calc.created_at)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(calc)}
                    disabled={downloading === calc.id}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="تحميل كصورة"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(calc.id)}
                    disabled={deleting === calc.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="حذف الحسبة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
