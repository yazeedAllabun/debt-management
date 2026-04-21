import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
const KEY = 'employee_session'

export function EmployeeSessionProvider({ children }) {
  const [currentEmployee, setCurrentEmployee] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
  })

  const employeeLogin = (emp) => {
    const session = { id: emp.id, name: emp.name, role: emp.role, permissions: emp.permissions }
    localStorage.setItem(KEY, JSON.stringify(session))
    setCurrentEmployee(session)
  }

  const employeeLogout = () => {
    localStorage.removeItem(KEY)
    setCurrentEmployee(null)
  }

  return (
    <Ctx.Provider value={{ currentEmployee, employeeLogin, employeeLogout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useEmployeeSession = () => useContext(Ctx)
