const PAYMENT = {
  paid:            { label: 'تم السداد',    cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  under_review:    { label: 'تحت الدراسة', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  request_created: { label: 'إنشاء طلب',   cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
  pending:         { label: 'لم يتم السداد', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
}

const FINANCING = {
  approved:        { label: 'تم التمويل',       cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  under_review:    { label: 'تحت الدراسة',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  request_created: { label: 'إنشاء طلب',        cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
  pending:         { label: 'بانتظار السداد',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
}

export function Badge({ status, type = 'payment' }) {
  const map  = type === 'financing' ? FINANCING : PAYMENT
  const item = map[status] || map.pending

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${item.cls}`}>
      {item.label}
    </span>
  )
}
