'use client'

import { Bell, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 hidden sm:block">
          Olá, <span className="font-medium text-slate-700">{session?.user?.name?.split(' ')[0]}</span>
        </span>
        <div className="w-px h-5 bg-slate-200" />
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {session?.user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
