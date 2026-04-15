import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { OwnerSessionProvider } from './context/OwnerSessionContext'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { ClientsPage } from './components/clients/ClientsPage'
import { AddClientPage } from './components/add-client/AddClientPage'
import { ReportsPage } from './components/reports/ReportsPage'
import { OwnerPage } from './components/owner/OwnerPage'
import { CalculatorPage } from './components/calculator/CalculatorPage'
import { EmployeesPage } from './components/employees/EmployeesPage'

export default function App() {
  return (
    <ThemeProvider>
      <OwnerSessionProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="add-client" element={<AddClientPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="owner" element={<OwnerPage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="employees" element={<EmployeesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </OwnerSessionProvider>
    </ThemeProvider>
  )
}
