import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
