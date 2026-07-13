# Carteira de Investimentos

App para acompanhar uma carteira de investimentos: ações, FIIs, ETFs, cripto,
renda fixa e outros. Registra compras/vendas, calcula preço médio, valor
investido, valor atual e rentabilidade, e busca cotações automaticamente.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (banco local em arquivo)
- [Recharts](https://recharts.org) para o gráfico de composição

## Como rodar localmente

```bash
npm install
npx prisma migrate dev   # cria o banco SQLite em prisma/dev.db
npm run dev
```

Acesse http://localhost:3000.

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

> Nota: em ambientes com acesso à internet restrito (ex: alguns sandboxes de
> desenvolvimento), as chamadas a brapi.dev/CoinGecko podem falhar por
> política de rede — isso não é um bug do app. Em produção, com acesso normal
> à internet, funciona normalmente.

## Cálculo de preço médio

O preço médio de cada ativo é recalculado a cada compra (método de custo
médio ponderado, o padrão contábil usado no Brasil). Vendas não alteram o
preço médio; o lucro realizado na venda é `(preço de venda - preço médio) *
quantidade vendida`.

## Modelo de dados

- `Asset`: ticker, nome, tipo, preço atual e data da última cotação.
- `Transaction`: compra ou venda de um ativo, quantidade, preço e data.

## Variáveis de ambiente

Veja `.env` (não commitado):

```
DATABASE_URL="file:./dev.db"
BRAPI_TOKEN=""   # opcional
```

## Limitações conhecidas / próximos passos

- Aplicação single-user, sem autenticação.
- Banco SQLite em arquivo — não persiste em deploys serverless (ex: Vercel)
  sem trocar para um banco gerenciado (Postgres, etc). Para produção, trocar
  o `provider` do Prisma para `postgresql` e apontar `DATABASE_URL` para um
  banco gerenciado.
