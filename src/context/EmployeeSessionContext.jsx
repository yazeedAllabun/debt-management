import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)
const KEY = 'employee_session'

export function EmployeeSessionProvider({ children }) {
  const [currentEmployee, setCurrentEmployee] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
  })
  const channelRef = useRef(null)

  const employeeLogout = async () => {
    const stored = (() => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } })()
    if (stored?.id) {
      supabase.from('employees').update({ session_token: null }).eq('id', stored.id).then(() => {}).catch(() => {})
    }
    localStorage.removeItem(KEY)
    setCurrentEmployee(null)
  }

  const employeeLogin = async (emp) => {
    const token = crypto.randomUUID()
    await supabase.from('employees').update({ session_token: token }).eq('id', emp.id)
    const session = { id: emp.id, name: emp.name, role: emp.role, permissions: emp.permissions, session_token: token }
    localStorage.setItem(KEY, JSON.stringify(session))
    setCurrentEmployee(session)
  }

  /* التحقق من الجلسة عند تحميل التطبيق */
  useEffect(() => {
    const stored = (() => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } })()
    if (!stored?.id) return
    supabase.from('employees').select('session_token, permissions, role').eq('id', stored.id).single()
      .then(({ data, error }) => {
        if (!error && data) {
          if (data.session_token !== stored.session_token) {
            employeeLogout()
          } else {
            const updated = { ...stored, permissions: data.permissions, role: data.role }
            localStorage.setItem(KEY, JSON.stringify(updated))
            setCurrentEmployee(updated)
          }
        }
      })
      .catch(() => { /* إذا كان غير متصل ابق الجلسة */ })
  }, [])

  /* مراقبة Realtime — تسجيل خروج فوري عند تغيير الجلسة من جهاز آخر */
  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    if (!currentEmployee?.id) return

    const channel = supabase
      .channel(`emp-session-${currentEmployee.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'employees', filter: `id=eq.${currentEmployee.id}` },
        (payload) => {
          const stored = (() => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } })()
          if (!stored) return
          if (payload.new.session_token !== stored.session_token) {
            employeeLogout()
            return
          }
          const updated = { ...stored, permissions: payload.new.permissions, role: payload.new.role }
          localStorage.setItem(KEY, JSON.stringify(updated))
          setCurrentEmployee(updated)
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [currentEmployee?.id])

  return (
    <Ctx.Provider value={{ currentEmployee, employeeLogin, employeeLogout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useEmployeeSession = () => useContext(Ctx)
