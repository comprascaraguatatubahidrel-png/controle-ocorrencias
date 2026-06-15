import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const supplierSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  contact: z.string().optional(),
  active: z.boolean().default(true),
})

export const missingItemSchema = z.object({
  product: z.string().min(1, 'Produto é obrigatório'),
  missingQty: z.number().positive('Quantidade deve ser positiva'),
})

export const treatmentSchema = z.object({
  type: z.enum(['ENTREGA_FUTURA', 'DESCONTO_EM_BOLETO', 'CREDITO_FUTURO', 'OUTRO']),
  promisedDate: z.string().optional().nullable(),
  observations: z.string().optional(),
  status: z.enum(['AGUARDANDO', 'EM_ANDAMENTO', 'CONCLUIDA']).default('AGUARDANDO'),
})

export const refusalSchema = z.object({
  reason: z.enum(['PRODUTO_INCORRETO', 'DIVERGENCIA_DE_PRECO', 'PRODUTO_AVARIADO', 'FALTA_DE_MERCADORIA', 'OUTRO']),
  description: z.string().optional(),
  status: z.enum(['RECUSADA', 'AGUARDANDO_NOVA_NF', 'RESOLVIDA']).default('RECUSADA'),
})

export const occurrenceSchema = z.object({
  nfNumber: z.string().min(1, 'Número da NF é obrigatório'),
  supplierId: z.string().min(1, 'Fornecedor é obrigatório'),
  nfDate: z.string().min(1, 'Data da NF é obrigatória'),
  nfValue: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['NF_COM_FALTA', 'NF_RECUSADA']),
  responsibleId: z.string().min(1, 'Responsável é obrigatório'),
  status: z.enum(['ABERTA', 'AGUARDANDO_FORNECEDOR', 'EM_TRATATIVA', 'RESOLVIDA', 'CANCELADA']).default('ABERTA'),
  observations: z.string().optional(),
  supplierAcknowledged: z.enum(['SIM', 'NAO', 'AGUARDANDO_RETORNO']).default('AGUARDANDO_RETORNO'),
  missingItems: z.array(missingItemSchema).optional(),
  treatment: treatmentSchema.optional().nullable(),
  refusal: refusalSchema.optional().nullable(),
})

export const statusUpdateSchema = z.object({
  status: z.enum(['ABERTA', 'AGUARDANDO_FORNECEDOR', 'EM_TRATATIVA', 'RESOLVIDA', 'CANCELADA']),
  comment: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SupplierFormData = z.infer<typeof supplierSchema>
export type OccurrenceFormData = z.infer<typeof occurrenceSchema>
export type TreatmentFormData = z.infer<typeof treatmentSchema>
export type RefusalFormData = z.infer<typeof refusalSchema>
export type MissingItemFormData = z.infer<typeof missingItemSchema>
export type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>
