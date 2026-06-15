# Controle de Ocorrências

Sistema completo para registro e acompanhamento de problemas e ocorrências relacionadas a Notas Fiscais (NFs), desenvolvido com Next.js 15, Prisma e PostgreSQL (Neon).

## 🚀 Funcionalidades

- **Dashboard Analítico**: Gráficos, métricas, indicadores e alertas de prazo.
- **Controle Completo**: Criação e gestão de ocorrências de NFs (Com Falta ou Recusada).
- **Tratativas Customizadas**: Sessões diferentes com base no tipo de ocorrência, com gerenciamento completo de itens faltantes.
- **Histórico e Timeline**: Histórico imutável de todas as alterações de status, comentários e anexos.
- **Anexos e Documentos**: Upload de imagens e PDFs integrados diretamente ao Cloudinary.
- **Sistema de Alertas**: Avisos visuais baseados na proximidade ou vencimento das datas prometidas pelos fornecedores (No Prazo, Vence em Breve, Atrasado).
- **Gestão de Fornecedores**: Cadastro com soft delete e busca por nome/CNPJ.
- **Autenticação**: Acesso seguro via Auth.js (NextAuth) com perfis (Admin e Usuário).

## 🛠️ Stack Tecnológica

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma ORM**
- **Neon PostgreSQL** (Banco de dados serverless)
- **Auth.js v5** (Beta)
- **Cloudinary** (Armazenamento de mídia)
- **React Hook Form** + **Zod** (Validação de formulários)
- **TanStack Table** (Tabelas e paginação)
- **Recharts** (Visualização de dados)
- **Lucide React** (Ícones)

## ⚙️ Configuração do Ambiente

1. Clone o repositório ou baixe os arquivos da aplicação.

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto copiando o modelo de `.env.example`:
```bash
cp .env.example .env
```

### Neon PostgreSQL (Banco de Dados)
1. Crie uma conta gratuita em [neon.tech](https://neon.tech/)
2. Crie um novo projeto e copie a "Connection String" (Pooled).
3. Cole a URL nas variáveis `DATABASE_URL` e `DIRECT_URL` no seu arquivo `.env`.

### Cloudinary (Upload de Arquivos)
1. Crie uma conta gratuita em [cloudinary.com](https://cloudinary.com/)
2. Acesse o Dashboard e copie o seu *Cloud Name*, *API Key* e *API Secret*.
3. Preencha as variáveis `CLOUDINARY_*` no seu arquivo `.env`.

### NextAuth (Autenticação)
1. Gere um secret seguro utilizando o comando (em um terminal bash):
```bash
openssl rand -base64 32
```
2. Cole o resultado na variável `NEXTAUTH_SECRET`.

## 🌱 Banco de Dados e Seed

Após configurar o arquivo `.env`, rode os seguintes comandos para criar as tabelas e popular o banco com os dados de exemplo:

```bash
# Sincroniza o schema com o banco de dados
npx prisma db push

# (Opcional) Executa o seed para popular com o Admin padrão e dados de teste
npm run ts-node --compilerOptions '{"module":"CommonJS"}' prisma/seed.ts
# Ou diretamente:
npx tsx prisma/seed.ts
```

> **Atenção:** O Seed criará o usuário admin inicial.

**Credenciais padrão geradas pelo Seed:**
- **Email:** `admin@controle.com`
- **Senha:** `admin123`

## ▶️ Rodando Localmente

Para rodar o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 🚀 Deploy na Vercel

Este projeto está pronto para ser hospedado gratuitamente na Vercel.

1. Suba seu código para o GitHub.
2. Acesse a [Vercel](https://vercel.com/) e crie um novo projeto importando seu repositório.
3. No passo de configuração de ambiente da Vercel (Environment Variables), adicione todas as variáveis que você configurou no seu `.env` local.
4. O build rodará automaticamente `prisma generate` e a aplicação estará no ar!

> **Dica para Build:** O Next.js verifica tipos rigorosamente. Caso você deseje contornar a verificação de tipos temporariamente durante o deploy, você pode adicionar a configuração de `ignoreBuildErrors: true` dentro do seu `next.config.js` (Não recomendado para produção em longo prazo).
