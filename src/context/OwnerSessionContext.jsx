import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)
const LOCAL_KEY = 'owner_session'
const TOKEN_KEY = 'owner_session_token'
const DB_KEY    = 'owner_session_token'

export function OwnerSessionProvider({ children }) {
  const [isOwner, setIsOwner] = useState(() => localStorage.getItem(LOCAL_KEY) === '1')
  const channelRef = useRef(null)

  const ownerLogout = () => {
    supabase.from('settings').upsert({ key: DB_KEY, value: null }).then(() => {}).catch(() => {})
    localStorage.removeItem(LOCAL_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setIsOwner(false)
  }

  const ownerLogin = async () => {
    const token = crypto.randomUUID()
    await supabase.from('settings').upsert({ key: DB_KEY, value: token })
    localStorage.setItem(LOCAL_KEY, '1')
    localStorage.setItem(TOKEN_KEY, token)
    setIsOwner(true)
  }

  /* التحقق من الجلسة عند تحميل التطبيق */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token || localStorage.getItem(LOCAL_KEY) !== '1') return
    supabase.from('settings').select('value').eq('key', DB_KEY).single()
      .then(({ data, error }) => {
        if (!error && data && data.value !== token) ownerLogout()
      }).catch(() => {})
  }, [])

  /* مراقبة Realtime — تسجيل خروج فوري عند تغيير الجلسة من جهاز آخر */
  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    if (!isOwner) return

    const channel = supabase
      .channel('owner-session')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings', filter: `key=eq.${DB_KEY}` },
        (payload) => {
          const localToken = localStorage.getItem(TOKEN_KEY)
          if (localToken && payload.new.value !== localToken) ownerLogout()
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [isOwner])

  return (
    <Ctx.Provider value={{ isOwner, ownerLogin, ownerLogout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useOwnerSession = () => useContext(Ctx)
