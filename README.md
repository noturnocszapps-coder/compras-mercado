# Compra Fácil by Roxou

Aplicação de gerenciamento de listas de compras inteligente.

## Tecnologias
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express (Bridge para APIs)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Pagamentos**: Stripe
- **IA**: Google Gemini API

## Estrutura do Projeto
- `src/`: Código fonte do frontend React.
- `api/`: Handlers do backend para processamento de IA e Pagamentos.
- `server.ts`: Servidor Express unificado (serve a API e o Vite em desenvolvimento).
- `supabase/`: Migrations e definições do banco de dados.

## Como Rodar Localmente

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env` baseado no `.env.example` e preencha as chaves:
   - Supabase (URL e Anon Key)
   - Stripe (Secret e Webhook)
   - Gemini API Key

3. **Executar em modo desenvolvimento**:
   ```bash
   npm run dev
   ```
   O app estará disponível em `http://localhost:3000`.

4. **Build para Produção**:
   ```bash
   npm run build
   ```

## Opções de Deploy

### Vercel
O projeto possui um arquivo `vercel.json` configurado para SPA. Para as rotas de API funcionarem na Vercel, recomenda-se configurar as funções na pasta `api/` seguindo o padrão da Vercel ou utilizar um adapter.

### Servidor Node.js (Railway / Render / Heroku)
Basta executar:
```bash
npm run build
npm start
```

## Variáveis de Ambiente Necessárias
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave anônima pública do Supabase.
- `GEMINI_API_KEY`: Chave da API do Google AI Studio.
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Chave pública do Stripe.
