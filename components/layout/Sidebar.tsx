'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  LogOut,
  ChevronRight,
  User,
  Shield,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Ocorrências',
    href: '/ocorrencias',
    icon: ClipboardList,
  },
  {
    label: 'Fornecedores',
    href: '/fornecedores',
    icon: Building2,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 flex flex-col z-40 shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Controle de</p>
            <p className="text-blue-400 font-bold text-sm leading-tight">Ocorrências</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Menu Principal
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className={cn(
                'w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110',
                active ? 'text-white' : 'text-slate-500 group-hover:text-white'
              )} style={{ width: '18px', height: '18px' }} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 text-blue-300" />}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
            {getInitials(session?.user?.name || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {session?.user?.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {session?.user?.role === 'ADMIN' ? (
                <Shield className="w-3 h-3 text-blue-400" />
              ) : (
                <User className="w-3 h-3 text-slate-500" />
              )}
              <p className="text-slate-500 text-xs capitalize">
                {session?.user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}
