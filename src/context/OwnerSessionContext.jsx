import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)

export function OwnerSessionProvider({ children }) {
  const [isOwner, setIsOwner] = useState(() => localStorage.getItem('owner_session') === '1')

  const ownerLogin  = () => { localStorage.setItem('owner_session', '1'); setIsOwner(true) }
  const ownerLogout = () => { localStorage.removeItem('owner_session'); setIsOwner(false) }

  return <Ctx.Provider value={{ isOwner, ownerLogin, ownerLogout }}>{children}</Ctx.Provider>
}

export const useOwnerSession = () => useContext(Ctx)
