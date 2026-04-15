import * as XLSX from 'xlsx'
import { formatDate, calcProfit } from './formatters'

export function exportToExcel(clients, filename = 'تقرير-العملاء') {
  const rows = clients.map(c => ({
    'الاسم': c.name,
    'رقم الجوال': c.phone || '',
    'البنك': Array.isArray(c.bank_names) ? c.bank_names.join('، ') : (c.bank_name || ''),
    'مبلغ التسوية': c.debt_amount,
    'العمولة %': c.commission_pct,
    'الربح': calcProfit(c.debt_amount, c.commission_pct).toFixed(2),
    'إجراءات السداد': c.payment_status,
    'إجراءات التمويل': c.financing_status,
    'تاريخ الإضافة': formatDate(c.created_at),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!dir'] = 'rtl'

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'العملاء')
  XLSX.writeFile(wb, `${filename}-${Date.now()}.xlsx`)
}
