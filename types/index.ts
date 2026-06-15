import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// App-specific types
export type UserRole = 'ADMIN' | 'USUARIO'
export type OccurrenceType = 'NF_COM_FALTA' | 'NF_RECUSADA'
export type OccurrenceStatus = 'ABERTA' | 'AGUARDANDO_FORNECEDOR' | 'EM_TRATATIVA' | 'RESOLVIDA' | 'CANCELADA'
export type SupplierAcknowledged = 'SIM' | 'NAO' | 'AGUARDANDO_RETORNO'
export type TreatmentType = 'ENTREGA_FUTURA' | 'DESCONTO_EM_BOLETO' | 'CREDITO_FUTURO' | 'OUTRO'
export type TreatmentStatus = 'AGUARDANDO' | 'EM_ANDAMENTO' | 'CONCLUIDA'
export type RefusalReason = 'PRODUTO_INCORRETO' | 'DIVERGENCIA_DE_PRECO' | 'PRODUTO_AVARIADO' | 'FALTA_DE_MERCADORIA' | 'OUTRO'
export type RefusalStatus = 'RECUSADA' | 'AGUARDANDO_NOVA_NF' | 'RESOLVIDA'
export type AttachmentType = 'IMAGE' | 'PDF'
export type AlertLevel = 'green' | 'yellow' | 'red' | 'none'

export interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

export interface SupplierData {
  id: string
  name: string
  cnpj?: string | null
  contact?: string | null
  active: boolean
  createdAt: Date
  _count?: { occurrences: number }
}

export interface MissingItemData {
  id: string
  occurrenceId: string
  product: string
  missingQty: number | string
}

export interface TreatmentData {
  id: string
  occurrenceId: string
  type: TreatmentType
  promisedDate?: Date | string | null
  observations?: string | null
  status: TreatmentStatus
}

export interface RefusalDetailData {
  id: string
  occurrenceId: string
  reason: RefusalReason
  description?: string | null
  status: RefusalStatus
}

export interface AttachmentData {
  id: string
  occurrenceId: string
  url: string
  publicId: string
  type: AttachmentType
  name: string
  createdAt: Date | string
}

export interface OccurrenceHistoryData {
  id: string
  occurrenceId: string
  userId: string
  action: string
  details?: string | null
  createdAt: Date | string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface OccurrenceData {
  id: string
  nfNumber: string
  supplierId: string
  nfDate: Date | string
  nfValue: number | string
  type: OccurrenceType
  responsibleId: string
  status: OccurrenceStatus
  observations?: string | null
  supplierAcknowledged: SupplierAcknowledged
  createdAt: Date | string
  updatedAt: Date | string
  supplier: SupplierData
  responsible: UserData
  missingItems?: MissingItemData[]
  treatment?: TreatmentData | null
  refusal?: RefusalDetailData | null
  attachments?: AttachmentData[]
  history?: OccurrenceHistoryData[]
}

export interface DashboardStats {
  open: number
  resolved: number
  nfWithMissing: number
  nfRefused: number
  overdue: number
}

export interface OccurrenceFilters {
  supplierId?: string
  type?: OccurrenceType
  status?: OccurrenceStatus
  responsibleId?: string
  nfNumber?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
