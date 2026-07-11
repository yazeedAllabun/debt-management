import { useOwnerSession } from '../context/OwnerSessionContext'
import { useEmployeeSession } from '../context/EmployeeSessionContext'

export function usePermissions() {
  const { isOwner } = useOwnerSession()
  const { currentEmployee } = useEmployeeSession()
  const can = (perm) => isOwner || (currentEmployee?.permissions?.includes(perm) ?? false)
  return { can, isOwner, currentEmployee }
}
