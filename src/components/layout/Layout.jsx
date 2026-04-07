import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <Sidebar />
      {/* Main content - offset for fixed header (top-16) and right sidebar (mr-64) */}
      <main className="mr-64 pt-16 min-h-screen">
        <div className="p-6 print-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
