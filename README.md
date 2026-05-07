# Compra Fácil by Roxou - Professional SaaS Architecture

Esta aplicação é um gerenciador de compras inteligente alimentado por IA, construído com uma arquitetura SaaS moderna, segura e escalável.

## 🚀 Tecnologias

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + Motion (Framer Motion)
- **Backend:** Express (Node.js) + Serverless Ready
- **Database / Auth:** Supabase
- **Payments:** Stripe (Checkout, Billing, Portal, Webhooks)
- **AI:** Google Gemini 1.5 Flash

## 🛡️ Arquitetura de Segurança

- **Isolamento de Secrets:** Nenhuma chave sensível (`GEMINI_API_KEY`, `STRIPE_SECRET_KEY`) é exposta ao frontend. Toda a inteligência e processamento de pagamentos ocorre no servidor.
- **Configuração Centralizada:** Todas as variáveis de ambiente públicas são gerenciadas em `src/config/env.ts` com validação em tempo de execução.
- **Feature Flags:** Sistema de controle de recursos em `src/config/features.ts`.
- **Billing Seguro:** Mapeamento de preços Stripe feito exclusivamente no backend para evitar manipulações no cliente.

## ⚙️ Configuração (Variáveis de Ambiente)

Copia o arquivo `.env.example` para `.env` e preencha as variáveis:

### Frontend (Propriedade `VITE_`)
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave anônima pública do Supabase.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Chave pública do Stripe.
- `VITE_APP_URL`: URL base da aplicação (usada para redirects).

### Backend (Segurança Máxima)
- `GEMINI_API_KEY`: Chave da API do Google Gemini.
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe.
- `STRIPE_WEBHOOK_SECRET`: Segredo para validação de webhooks do Stripe.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço (admin) do Supabase para bypass de RLS no backend.

### Stripe Products
- `STRIPE_PRICE_PREMIUM_MONTHLY`: Price ID do plano mensal.
- `STRIPE_PRICE_PREMIUM_YEARLY`: Price ID do plano anual.
- `STRIPE_PRICE_FAMILY_MONTHLY`: Price ID do plano família.

## 📦 Desenvolvendo Localmente

1. `npm install`
2. Configure o `.env`
3. `npm run dev` (Inicia o servidor Express + Vite Middleware)

## 🚢 Deploy

O projeto está configurado para deploy em ambientes Node.js ou Vercel (via API routes). O `server.ts` serve como ponto de entrada principal para a plataforma Google Cloud Run onde esta aplicação reside.

---
Desenvolvido com ❤️ por **Roxou**
