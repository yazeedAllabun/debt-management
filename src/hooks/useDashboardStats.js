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
      } catch { return false }
    })

    // إجراءات السداد
    const paymentDone    = clients.filter(c => c.payment_status === 'paid').length
    const paymentPending = clients.filter(c => c.payment_status !== 'paid').length

    // إجراءات التمويل
    const financingDone    = clients.filter(c => c.financing_status === 'approved').length
    const financingPending = clients.filter(c => c.financing_status !== 'approved').length

    // الحالات المعلقة (كل ما لم يكتمل السداد والتمويل معاً)
    const pendingCases = clients.filter(
      c => c.payment_status !== 'paid' || c.financing_status !== 'approved'
    ).length

    // تفاصيل حالات السداد
    const paymentUnderReview    = clients.filter(c => c.payment_status === 'under_review').length
    const paymentRequestCreated = clients.filter(c => c.payment_status === 'request_created').length

    // تفاصيل حالات التمويل
    const financingUnderReview    = clients.filter(c => c.financing_status === 'under_review').length
    const financingRequestCreated = clients.filter(c => c.financing_status === 'request_created').length

    const totalPaid   = clients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0)
    const totalDebt   = clients.reduce((s, c) => s + (parseFloat(c.debt_amount) || 0), 0)
    const totalProfit = clients.reduce(
      (s, c) => s + calcProfit(c.debt_amount, c.commission_pct), 0
    )
    const thisMonthDebt = thisMonthClients.reduce(
      (s, c) => s + (parseFloat(c.debt_amount) || 0), 0
    )

    return {
      totalClients: clients.length,
      paymentDone,
      paymentPending,
      paymentUnderReview,
      paymentRequestCreated,
      financingDone,
      financingPending,
      financingUnderReview,
      financingRequestCreated,
      pendingCases,
      totalPaid,
      totalDebt,
      totalProfit,
      thisMonthClients: thisMonthClients.length,
      thisMonthDebt,
    }
  }, [clients])
}
