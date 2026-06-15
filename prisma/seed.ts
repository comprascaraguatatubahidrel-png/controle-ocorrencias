import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@controle.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@controle.com',
      passwordHash,
      role: UserRole.ADMIN,
    },
  })

  console.log('✅ Usuário admin criado:', admin.email)

  // Create a regular user
  const userHash = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'usuario@controle.com' },
    update: {},
    create: {
      name: 'Usuário Padrão',
      email: 'usuario@controle.com',
      passwordHash: userHash,
      role: UserRole.USUARIO,
    },
  })

  console.log('✅ Usuário padrão criado:', user.email)

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-1' },
    update: {},
    create: {
      id: 'seed-supplier-1',
      name: 'Fornecedor Alpha Ltda',
      cnpj: '12.345.678/0001-90',
      contact: '(11) 99999-0001',
      active: true,
    },
  })

  const supplier2 = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-2' },
    update: {},
    create: {
      id: 'seed-supplier-2',
      name: 'Beta Distribuidora S.A.',
      cnpj: '98.765.432/0001-10',
      contact: '(11) 99999-0002',
      active: true,
    },
  })

  const supplier3 = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-3' },
    update: {},
    create: {
      id: 'seed-supplier-3',
      name: 'Gama Comércio e Serviços',
      contact: '(21) 98888-0003',
      active: true,
    },
  })

  console.log('✅ Fornecedores criados')

  // Create sample occurrences
  const occ1 = await prisma.occurrence.upsert({
    where: { id: 'seed-occ-1' },
    update: {},
    create: {
      id: 'seed-occ-1',
      nfNumber: 'NF-001234',
      supplierId: supplier1.id,
      nfDate: new Date('2026-06-01'),
      nfValue: 15000.00,
      type: 'NF_COM_FALTA',
      responsibleId: admin.id,
      status: 'EM_TRATATIVA',
      supplierAcknowledged: 'SIM',
      observations: 'Faltaram 3 caixas do produto X na entrega.',
      missingItems: {
        create: [
          { product: 'Produto X - Cx 500ml', missingQty: 3 },
          { product: 'Produto Y - Pacote 1kg', missingQty: 1 },
        ],
      },
      treatment: {
        create: {
          type: 'ENTREGA_FUTURA',
          promisedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          observations: 'Fornecedor confirma entrega dos itens faltantes.',
          status: 'EM_ANDAMENTO',
        },
      },
    },
  })

  const occ2 = await prisma.occurrence.upsert({
    where: { id: 'seed-occ-2' },
    update: {},
    create: {
      id: 'seed-occ-2',
      nfNumber: 'NF-005678',
      supplierId: supplier2.id,
      nfDate: new Date('2026-06-05'),
      nfValue: 8750.50,
      type: 'NF_RECUSADA',
      responsibleId: user.id,
      status: 'AGUARDANDO_FORNECEDOR',
      supplierAcknowledged: 'AGUARDANDO_RETORNO',
      observations: 'Produto entregue com avaria visível na embalagem.',
      refusal: {
        create: {
          reason: 'PRODUTO_AVARIADO',
          description: 'Embalagem amassada e produto com risco de contaminação.',
          status: 'RECUSADA',
        },
      },
    },
  })

  const occ3 = await prisma.occurrence.upsert({
    where: { id: 'seed-occ-3' },
    update: {},
    create: {
      id: 'seed-occ-3',
      nfNumber: 'NF-009012',
      supplierId: supplier3.id,
      nfDate: new Date('2026-05-20'),
      nfValue: 22300.00,
      type: 'NF_COM_FALTA',
      responsibleId: admin.id,
      status: 'RESOLVIDA',
      supplierAcknowledged: 'SIM',
      observations: 'Resolvido com desconto em boleto.',
      missingItems: {
        create: [
          { product: 'Produto Z - Unidade', missingQty: 10 },
        ],
      },
      treatment: {
        create: {
          type: 'DESCONTO_EM_BOLETO',
          promisedDate: new Date('2026-05-28'),
          observations: 'Desconto de R$ 500,00 aplicado no boleto seguinte.',
          status: 'CONCLUIDA',
        },
      },
    },
  })

  // Create history for occurrences
  await prisma.occurrenceHistory.createMany({
    data: [
      {
        occurrenceId: occ1.id,
        userId: admin.id,
        action: 'Ocorrência criada',
        details: 'Ocorrência registrada no sistema',
      },
      {
        occurrenceId: occ1.id,
        userId: admin.id,
        action: 'Status alterado',
        details: 'Status alterado de ABERTA para EM_TRATATIVA',
      },
      {
        occurrenceId: occ2.id,
        userId: user.id,
        action: 'Ocorrência criada',
        details: 'Ocorrência registrada no sistema',
      },
      {
        occurrenceId: occ3.id,
        userId: admin.id,
        action: 'Ocorrência criada',
        details: 'Ocorrência registrada no sistema',
      },
      {
        occurrenceId: occ3.id,
        userId: admin.id,
        action: 'Status alterado',
        details: 'Status alterado de EM_TRATATIVA para RESOLVIDA',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Ocorrências de exemplo criadas')
  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('Credenciais de acesso:')
  console.log('  Admin: admin@controle.com / admin123')
  console.log('  Usuário: usuario@controle.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
