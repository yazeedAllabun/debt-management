import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export function formatCurrency(amount) {
  if (amount == null) return '0 ر.س'
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num) {
  if (num == null) return '0'
  return new Intl.NumberFormat('ar-SA').format(num)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ar })
  } catch {
    return dateStr
  }
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'MMMM yyyy', { locale: ar })
  } catch {
    return dateStr
  }
}

export function calcProfit(debtAmount, paidAmount, commissionPct) {
  const debt = parseFloat(debtAmount) || 0
  const paid = parseFloat(paidAmount) || 0
  const pct = parseFloat(commissionPct) || 0
  return (debt - paid) * (pct / 100)
}
