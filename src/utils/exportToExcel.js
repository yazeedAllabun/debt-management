import * as XLSX from 'xlsx'
import { formatDate, calcProfit } from './formatters'

export function exportToExcel(clients, filename = 'تقرير-العملاء') {
  const rows = clients.map(c => ({
    'الاسم': c.name,
    'رقم الهوية': c.national_id,
    'رقم الجوال': c.phone || '',
    'البنك': c.bank_name || '',
    'مبلغ الدين': c.debt_amount,
    'المبلغ المدفوع': c.paid_amount,
    'العمولة %': c.commission_pct,
    'الربح': calcProfit(c.debt_amount, c.paid_amount, c.commission_pct).toFixed(2),
    'الحالة': c.status === 'paid' ? 'مكتمل' : 'معلق',
    'تاريخ الإضافة': formatDate(c.created_at),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!dir'] = 'rtl'

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'العملاء')
  XLSX.writeFile(wb, `${filename}-${Date.now()}.xlsx`)
}
