import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

export function MultiSelect({ options, selected, onChange, placeholder = 'اختر...' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = (item) =>
    onChange(selected.includes(item) ? selected.filter(s => s !== item) : [...selected, item])

  const removeOne = (e, item) => {
    e.stopPropagation()
    onChange(selected.filter(s => s !== item))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-right flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selected.length === 0 ? (
            <span className="text-sm text-gray-400">{placeholder}</span>
          ) : (
            selected.map(item => (
              <span
                key={item}
                className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
              >
                {item}
                <button type="button" onClick={e => removeOne(e, item)} className="hover:text-blue-900 dark:hover:text-blue-100">
                  <X size={10} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {options.map(item => {
            const checked = selected.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggle(item)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  checked ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                  checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {item}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
