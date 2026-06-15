export const OCCURRENCE_TYPE_LABELS = {
  NF_COM_FALTA: 'NF com Falta',
  NF_RECUSADA: 'NF Recusada',
} as const

export const OCCURRENCE_STATUS_LABELS = {
  ABERTA: 'Aberta',
  AGUARDANDO_FORNECEDOR: 'Aguardando Fornecedor',
  EM_TRATATIVA: 'Em Tratativa',
  RESOLVIDA: 'Resolvida',
  CANCELADA: 'Cancelada',
} as const

export const SUPPLIER_ACKNOWLEDGED_LABELS = {
  SIM: 'Sim',
  NAO: 'Não',
  AGUARDANDO_RETORNO: 'Aguardando Retorno',
} as const

export const TREATMENT_TYPE_LABELS = {
  ENTREGA_FUTURA: 'Entrega Futura',
  DESCONTO_EM_BOLETO: 'Desconto em Boleto',
  CREDITO_FUTURO: 'Crédito Futuro',
  OUTRO: 'Outro',
} as const

export const TREATMENT_STATUS_LABELS = {
  AGUARDANDO: 'Aguardando',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
} as const

export const REFUSAL_REASON_LABELS = {
  PRODUTO_INCORRETO: 'Produto Incorreto',
  DIVERGENCIA_DE_PRECO: 'Divergência de Preço',
  PRODUTO_AVARIADO: 'Produto Avariado',
  FALTA_DE_MERCADORIA: 'Falta de Mercadoria',
  OUTRO: 'Outro',
} as const

export const REFUSAL_STATUS_LABELS = {
  RECUSADA: 'Recusada',
  AGUARDANDO_NOVA_NF: 'Aguardando Nova NF',
  RESOLVIDA: 'Resolvida',
} as const

export const STATUS_COLORS: Record<string, string> = {
  ABERTA: 'bg-blue-100 text-blue-800 border-blue-200',
  AGUARDANDO_FORNECEDOR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  EM_TRATATIVA: 'bg-orange-100 text-orange-800 border-orange-200',
  RESOLVIDA: 'bg-green-100 text-green-800 border-green-200',
  CANCELADA: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const TYPE_COLORS: Record<string, string> = {
  NF_COM_FALTA: 'bg-purple-100 text-purple-800 border-purple-200',
  NF_RECUSADA: 'bg-red-100 text-red-800 border-red-200',
}

export const ALERT_COLORS: Record<string, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  none: '',
}

export const ITEMS_PER_PAGE = 10
