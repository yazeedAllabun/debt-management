import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function DateTimeDisplay() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(now)

  const greg = new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(now)

  const time = new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(now)

  return (
    <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 border-l border-gray-200 dark:border-gray-700 pl-3">
        <Clock size={15} />
        <span className="text-sm font-bold tabular-nums whitespace-nowrap">{time}</span>
      </div>
      <div className="leading-tight">
        <div className="text-[11.5px] font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
          {hijri} هـ
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap">
          {greg} م
        </div>
      </div>
    </div>
  )
}
