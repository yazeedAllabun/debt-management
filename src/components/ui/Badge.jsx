export function Badge({ status }) {
  const styles = {
    paid:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  }
  const labels = { paid: 'مكتمل', pending: 'معلق' }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}
