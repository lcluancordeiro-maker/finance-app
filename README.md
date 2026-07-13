# Meridiano Finanças

App de educação financeira e investimentos simulados: trilhas de lições com
quiz sobre economia e finanças, e uma carteira multiusuário com dinheiro
virtual (R$ 10.000,00 iniciais) para praticar compra e venda de ações, FIIs,
ETFs, cripto e renda fixa com cotações reais. Nenhuma operação move dinheiro
de verdade — é um ambiente de prática.

PWA: instalável na tela inicial do celular (web app, sem apps nativos).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (banco local em arquivo)
- [Recharts](https://recharts.org) para o gráfico de composição
- Autenticação por sessão em cookie httpOnly (`bcryptjs` + `jose`)

## Como rodar localmente

```bash
npm install
npx prisma migrate dev   # cria o banco SQLite em prisma/dev.db, aplica o schema e roda o seed
npm run dev
```

Acesse http://localhost:3000, crie uma conta e comece a praticar.

## Autenticação

Cadastro/login por e-mail e senha (`bcryptjs` para hash). A sessão é um JWT
assinado (`jose`) guardado em cookie httpOnly de 30 dias. `src/middleware.ts`
protege todas as rotas exceto `/login`, `/registrar` e `/api/auth/*`,
redirecionando usuários não autenticados para `/login`.

## Educação financeira

Três trilhas (Básico, Intermediário, Avançado) com lições e quiz. Uma lição
só é marcada como concluída quando o usuário acerta 100% do quiz
(`POST /api/lessons/:id/quiz`). Progresso é por usuário (`Progress`).

## Cotações automáticas

- **Ações, FIIs e ETFs**: [brapi.dev](https://brapi.dev) — tickers da B3
  (ex: `PETR4`, `MXRF11`). Opcionalmente defina `BRAPI_TOKEN` no `.env` para
  aumentar o limite de requisições (veja brapi.dev).
- **Cripto**: [CoinGecko](https://www.coingecko.com) — o "ticker" do ativo
  deve ser o **id da CoinGecko** (ex: `bitcoin`, `ethereum`, `solana`), não o
  símbolo.
- **Renda fixa e outros**: sem cotação automática — o preço atual é definido
  manualmente clicando no valor da coluna "Cotação atual" na tabela.

Clique em "Atualizar cotações" no topo do dashboard para buscar os preços
mais recentes de todos os ativos com cotação automática.

## Operações de compra/venda (simuladas)

Comprar/vender executa a ordem à **cotação atual** do ativo (como uma ordem a
mercado) para tipos com cotação automática — o preço não é digitável, só a
quantidade. Para renda fixa/outros (sem cotação automática) o preço é
informado manualmente. O servidor valida saldo em caixa suficiente (compra) e
posição suficiente (venda) antes de executar — ver `src/lib/orders.ts`.

O saldo em caixa é **derivado** do histórico de transações
(`startingCash - compras + vendas`), não armazenado — evita dessincronia
entre saldo e extrato. O ponto de extensão para uma corretora real fica em
`src/lib/orders.ts`/`placeOrder` (documentado em comentário) — hoje só a
execução simulada existe.

## Cálculo de preço médio

O preço médio de cada ativo é recalculado a cada compra (método de custo
médio ponderado, o padrão contábil usado no Brasil). Vendas não alteram o
preço médio; o lucro realizado na venda é `(preço de venda - preço médio) *
quantidade vendida`. Ver `src/lib/portfolio.ts`.

## Modelo de dados

- `User`: conta do usuário (nome, e-mail, hash de senha).
- `Portfolio`: carteira virtual do usuário (`startingCash`), 1:1 com `User`.
- `Asset`: catálogo global de ativos negociáveis (ticker, nome, tipo, preço
  atual) — compartilhado entre todos os usuários.
- `Transaction`: uma ordem executada (compra/venda), vinculada a `Portfolio`
  e `Asset`.
- `Track` / `Lesson` / `QuizQuestion`: conteúdo educacional.
- `Progress`: progresso do usuário por lição (concluída, nota do quiz).

## Variáveis de ambiente

Veja `.env.example`:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="troque-por-um-segredo-forte-em-producao"
BRAPI_TOKEN=""   # opcional
```

## Limitações conhecidas / próximos passos

- Banco SQLite em arquivo — não persiste em deploys serverless (ex: Vercel)
  sem trocar para um banco gerenciado (Postgres, etc). Para produção, trocar
  o `provider` do Prisma para `postgresql` e apontar `DATABASE_URL` para um
  banco gerenciado.
- PWA é apenas manifest + meta tags (instalável), sem service worker
  offline.
- `DELETE /api/assets/:id` remove o ativo do catálogo compartilhado e
  cascade-apaga as transações de **todos** os usuários que o negociaram —
  aceitável para um app pequeno/pessoal, mas vale revisar antes de escalar
  para muitos usuários.
