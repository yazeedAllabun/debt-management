import { useMemo } from 'react'
import { calcProfit } from '../utils/formatters'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export function useDashboardStats(clients) {
  return useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const thisMonthClients = clients.filter(c => {
      try {
        return isWithinInterval(new Date(c.created_at), { start: monthStart, end: monthEnd })
      } catch {
        return false
      }
    })

    const paidClients = clients.filter(c => c.status === 'paid')
    const totalDebt = clients.reduce((sum, c) => sum + (parseFloat(c.debt_amount) || 0), 0)
    const totalPaid = clients.reduce((sum, c) => sum + (parseFloat(c.paid_amount) || 0), 0)
    const totalProfit = clients.reduce(
      (sum, c) => sum + calcProfit(c.debt_amount, c.paid_amount, c.commission_pct),
      0
    )
    const thisMonthDebt = thisMonthClients.reduce(
      (sum, c) => sum + (parseFloat(c.debt_amount) || 0),
      0
    )

    return {
      totalClients: clients.length,
      paidClientsCount: paidClients.length,
      pendingClientsCount: clients.length - paidClients.length,
      totalDebt,
      totalPaid,
      totalProfit,
      thisMonthClients: thisMonthClients.length,
      thisMonthDebt,
    }
  }, [clients])
}
