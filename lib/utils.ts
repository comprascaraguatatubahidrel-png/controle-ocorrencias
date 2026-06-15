import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '')
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

export type AlertLevel = 'green' | 'yellow' | 'red' | 'none'

export function getAlertLevel(promisedDate: Date | string | null | undefined): AlertLevel {
  if (!promisedDate) return 'none'
  const date = new Date(promisedDate)
  const now = new Date()
  const twoDaysFromNow = addDays(now, 2)

  if (isBefore(date, now)) return 'red'
  if (isBefore(date, twoDaysFromNow)) return 'yellow'
  return 'green'
}

export function getAlertLabel(level: AlertLevel): string {
  switch (level) {
    case 'red': return 'Atrasado'
    case 'yellow': return 'Vence em breve'
    case 'green': return 'No prazo'
    case 'none': return ''
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
