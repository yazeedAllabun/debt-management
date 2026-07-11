import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { OwnerSessionProvider } from './context/OwnerSessionContext'
import { EmployeeSessionProvider } from './context/EmployeeSessionContext'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { ClientsPage } from './components/clients/ClientsPage'
import { AddClientPage } from './components/add-client/AddClientPage'
import { ReportsPage } from './components/reports/ReportsPage'
import { OwnerPage } from './components/owner/OwnerPage'
import { ClaudeCalculatorPage } from './components/claude-calculator/ClaudeCalculatorPage'
import { CalculationsPage } from './components/calculations/CalculationsPage'
import { EmployeesPage } from './components/employees/EmployeesPage'
import { EditClientPage } from './components/edit-client/EditClientPage'
import { SettingsPage } from './components/settings/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <OwnerSessionProvider>
        <EmployeeSessionProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="add-client" element={<AddClientPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="owner" element={<OwnerPage />} />
              <Route path="muhtasib" element={<ClaudeCalculatorPage />} />
              <Route path="calculations" element={<CalculationsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="edit-client/:id" element={<EditClientPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </EmployeeSessionProvider>
      </OwnerSessionProvider>
    </ThemeProvider>
  )
}
