# Plano de Implementação: Playwright E2E — Cuidly

## Contexto

O Cuidly é um SaaS de conexão entre famílias e babás, com Next.js 16, Supabase Auth, Asaas (pagamentos) e PostgreSQL via Prisma 7. O projeto tem Vitest para testes unitários e **Playwright para testes E2E**, com uma estratégia segura que garante que testes **nunca toquem dados de produção**, com cobertura progressiva dos fluxos críticos.

> **Nota histórica:** O projeto iniciou com Cypress, mas foi migrado para Playwright na Fase 2 devido a incompatibilidades do binário Electron do Cypress com WSL2. Toda a infra (scripts, seed, env) se manteve — apenas o test runner mudou.

### Status atual

| Fase | Status |
|------|--------|
| Fase 1 — Setup Básico | Concluída |
| Fase 2 — Infra de Testes | Concluída |
| Fase 3 — Primeiros Fluxos Críticos | Concluída |
| Fase 4 — Cobertura de Pagamento | Concluída |
| Fase 5 — CI/CD | Concluída |

### Resultado dos testes

```
16 spec files, 80+ testes
Cobertura: auth, público, família, babá, chat, assinaturas
```

---

## 1. Estrutura de Ambientes

| Ambiente | Supabase | Banco | Asaas | Domínio |
|----------|----------|-------|-------|---------|
| **dev** | Projeto dev (atual) | PostgreSQL dev | Sandbox | `localhost:3300` |
| **test** | **Projeto dedicado** | PostgreSQL test (isolado) | Sandbox | `localhost:3300` |
| **prod** | Projeto prod | PostgreSQL prod | Produção | `cuidly.com` |

**Regra de ouro:** O ambiente `test` usa um projeto Supabase completamente separado. Nunca compartilha banco com dev ou prod.

---

## 2. Estratégia de Variáveis de Ambiente

### Arquivos de env

```
apps/app/.env.local          → dev (padrão, já existe)
packages/e2e/.env.test       → test (usado pelo Playwright e scripts)
apps/app/.env.production     → prod (Vercel)
```

### Template: `packages/e2e/.env.test.example`

```env
# Supabase - Projeto de TESTE (separado)
NEXT_PUBLIC_SUPABASE_URL=https://xxx-test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...test
SUPABASE_SERVICE_ROLE_KEY=eyJ...test-service
SUPABASE_PROJECT_REF=xxx-test

# Banco de dados - Projeto de TESTE
DATABASE_URL=postgresql://...test-db
DIRECT_URL=postgresql://...test-db-direct

# Asaas - Sandbox
ASAAS_API_KEY=sandbox_api_key
ASAAS_ENVIRONMENT=sandbox
ASAAS_ACCESS_TOKEN=test_webhook_token
ASAAS_WALLET_ID=sandbox_wallet_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3300

# Captcha — NÃO definir para desabilitar automaticamente
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Email — Resend test key (não envia e-mails reais)
# RESEND_API_KEY=re_test_...
# RESEND_FROM_EMAIL=Cuidly Babás <noreply@test.cuidly.com>

# Sentry — NÃO definir para desabilitar
# SENTRY_DSN=
```

### Segurança

- `.env.test` já coberto pelo `.gitignore` (`**/.env*`)
- `.env.test.example` commitado no repo com placeholders
- CI usa GitHub Secrets para injetar variáveis
- Script de reset valida que a URL contém o project ref de teste ou "test"/"staging"/"localhost"

---

## 3. Reset de Banco de Teste

### Estratégia: TRUNCATE CASCADE + seed controlado

**Arquivo:** `packages/e2e/scripts/reset-test-db.ts`

1. Valida que `DATABASE_URL` contém o project ref de teste (safety check)
2. Conecta via Prisma com `@prisma/adapter-pg` usando `DIRECT_URL` (sem pgbouncer)
3. Executa `TRUNCATE ... CASCADE` em todas as tabelas usando nomes SQL reais (`@@map`)

**Tabelas truncadas** (nomes SQL reais do `schema.prisma`):

```
messages, participants, conversations, moderation_logs, notifications,
reviews, reports, job_applications, compatible_job_email_logs, jobs,
payments, pending_payment_operations, coupon_usages, coupon_allowed_emails,
subscriptions, coupons, "references", nanny_availabilities, favorites,
boosts, profile_analytics, bio_cache, user_profile_views,
children_families, children, documents, document_uploads,
validation_consent_logs, validation_requests, audit_logs,
cancellation_email_logs, pix_reminder_email_logs,
incomplete_profile_email_logs, system_configs, admin_users,
families, nannies, addresses, plans
```

**Quando executar:**

- Antes de toda a suite: `pnpm e2e:reset-db`
- **NÃO** entre cada spec (muito lento) — cada spec usa dados isolados

### Safety check

```typescript
const TEST_PROJECT_REF = 'wvhlgotaloagdfsxpqal';
const isTestDb =
  dbUrl.includes(TEST_PROJECT_REF) ||
  dbUrl.includes('test') ||
  dbUrl.includes('staging') ||
  dbUrl.includes('localhost');

if (!isTestDb) {
  throw new Error('ABORT: DATABASE_URL não parece ser de ambiente de teste!');
}
```

---

## 4. Seed Controlado

### Dois níveis de seed

**a) Seed base** (roda após reset):
- Cria 4 usuários de teste no Supabase (via Admin API com service role)
- Cria registros correspondentes no Prisma (Nanny, Family)
- Cria subscriptions (free + paid)
- Dados mínimos e determinísticos

**Arquivo:** `packages/e2e/scripts/create-test-users.ts`

**b) Factories** (por spec):
- Helper functions que criam dados sob demanda via API
- Ex: `await createNanny(page, { name: 'Ana', plan: 'PRO' })`
- Chamam APIs da app ou Prisma diretamente

### Usuários de teste

```typescript
export const TEST_USERS = {
  family:     { email: 'familia-teste@cuidly.com', password: 'TestPass123!', name: 'Família Teste',  type: 'FAMILY' },
  familyPaid: { email: 'familia-plus@cuidly.com',  password: 'TestPass123!', name: 'Família Plus',   type: 'FAMILY' },
  nanny:      { email: 'baba-teste@cuidly.com',    password: 'TestPass123!', name: 'Ana Teste',      type: 'NANNY'  },
  nannyPro:   { email: 'baba-pro@cuidly.com',      password: 'TestPass123!', name: 'Maria Pro',      type: 'NANNY'  },
};
```

| Chave | Tipo | Plano | Uso |
|-------|------|-------|-----|
| `family` | Família | FREE | Testes de features gratuitas |
| `familyPaid` | Família | PLUS | Testes de features pagas |
| `nanny` | Babá | FREE | Testes de features gratuitas |
| `nannyPro` | Babá | PRO | Testes de features pagas |

---

## 5. Autenticação Supabase nos Testes

### Estratégia: Login programático via Supabase REST API + cookies

**Por que não via UI:** Login pela UI a cada teste seria lento e flaky (Turnstile, redirects, etc).

**Helper `login()`** (`tests/helpers/auth.ts`):

```typescript
// 1. POST para Supabase /auth/v1/token?grant_type=password
// 2. Encode session como cookie no formato @supabase/ssr v0.6.1:
//    valor = "base64-" + base64url(JSON.stringify(session))
// 3. Chunkar se necessário (MAX_CHUNK_SIZE = 3180 chars URI-encoded)
//    Cookie único: sb-<ref>-auth-token
//    Chunked: sb-<ref>-auth-token.0, .1, etc.
// 4. context.addCookies() seta os cookies no browser
// 5. page.goto('/app') — middleware processa a sessão
```

**Atalhos:** `loginAsFamily()`, `loginAsFamilyPaid()`, `loginAsNanny()`, `loginAsNannyPro()`

**Captcha bypass:** O `TurnstileWidget` retorna `null` quando `NEXT_PUBLIC_TURNSTILE_SITE_KEY` não está definido (`apps/app/src/components/auth/TurnstileWidget.tsx:30-32`). No `.env.test`, simplesmente não definimos essa variável — zero mudanças de código.

**Criação de usuários no Supabase:**
- Script usa `supabase.auth.admin.createUser()` com service role key
- Flag `email_confirm: true` confirma o e-mail automaticamente
- Idempotente — pula usuários que já existem

---

## 6. Asaas Sandbox

### Estratégia híbrida: sandbox real + route.fulfill

**Quando usar sandbox real:**
- Testes de integração de pagamento completa
- Validação de criação de customer/subscription no Asaas

**Quando usar `page.route()` / mock:**
- Testes que dependem de pagamento mas não testam pagamento em si
- Testes de UI de checkout (validação de formulário, UX)
- Testes de features gated por plano

**Configuração:**
- `ASAAS_ENVIRONMENT=sandbox` no `.env.test` — o `AsaasGateway` já usa essa variável para alternar a `baseUrl` (`apps/app/src/lib/payment/asaas-gateway.ts:31-34`)
- Cartão de teste do sandbox: `5162 3060 0000 1048`

---

## 7. Webhooks em Ambiente de Teste

### Estratégia: Chamar o endpoint de webhook diretamente via `fetch()`

O webhook (`apps/app/src/app/api/webhooks/payment/route.ts`) valida via header `asaas-access-token`. No teste, conhecemos o token.

**Helper `simulatePaymentWebhook()`** (`tests/helpers/webhook.ts`):

```typescript
await fetch(`${baseURL}/api/webhooks/payment?gateway=ASAAS`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'asaas-access-token': process.env.ASAAS_ACCESS_TOKEN,
  },
  body: JSON.stringify({
    event: 'PAYMENT_CONFIRMED',
    payment: { id, subscription, status, value, billingType },
  }),
});
```

**Vantagens:**
- Sem necessidade de tunnel (ngrok)
- Determinístico e rápido
- Testa toda a lógica real do handler de webhook

---

## 8. Organização de Pastas

```
packages/e2e/
├── playwright.config.ts         # Config principal
├── package.json                 # @cuidly/e2e
├── tsconfig.json
├── .env.test.example            # Template de env
├── PLANO-E2E.md                 # Este documento
│
├── scripts/
│   ├── reset-test-db.ts         # Truncate + safety check
│   └── create-test-users.ts     # Cria usuários no Supabase + Prisma
│
├── seed/
│   └── test-seed.ts             # Dados determinísticos
│
└── tests/
    ├── auth/
    │   ├── login.spec.ts        # Login programático + login via UI
    │   └── signup.spec.ts       # Validação de formulário de cadastro
    │
    ├── public/
    │   ├── landing.spec.ts      # Smoke test da landing page
    │   └── nanny-profile.spec.ts # Perfil público de babá
    │
    ├── family/
    │   ├── search-nannies.spec.ts  # Busca de babás
    │   ├── create-job.spec.ts      # Criação de vaga
    │   └── view-applications.spec.ts # Candidaturas recebidas
    │
    ├── nanny/
    │   ├── view-jobs.spec.ts    # Listagem de vagas
    │   └── apply-job.spec.ts    # Candidatura a vaga
    │
    ├── chat/
    │   └── conversation.spec.ts # Conversas entre família e babá
    │
    ├── subscription/
    │   ├── subscription-page.spec.ts # Página de assinatura
    │   ├── nanny-upgrade.spec.ts     # Upgrade babá → Pro
    │   ├── family-upgrade.spec.ts    # Upgrade família → Plus
    │   ├── feature-gates.spec.ts     # Feature gates (free vs paid)
    │   ├── webhook.spec.ts           # Webhook de pagamento
    │   └── cancellation.spec.ts      # Cancelamento de assinatura
    │
    └── helpers/
        ├── auth.ts              # login(), loginAsFamily(), etc.
        └── webhook.ts           # simulatePaymentWebhook()
```

### Scripts disponíveis

| Comando (root) | Descrição |
|-----------------|-----------|
| `pnpm e2e` | Roda todos os testes headless |
| `pnpm e2e:headed` | Roda com browser visível |
| `pnpm e2e:ui` | Abre o Playwright UI interativo |
| `pnpm e2e:reset-db` | Trunca banco de teste |
| `pnpm e2e:create-users` | Cria usuários de teste |
| `pnpm e2e:test` | Reset + seed + run (pipeline completa) |

---

## 9. Estratégia Anti-Flaky

| Causa | Mitigação |
|-------|-----------|
| Dados compartilhados | Cada spec usa dados isolados (e-mails com timestamp) |
| Timing/loading | `expect(locator).toBeVisible()` antes de interagir; nunca `page.waitForTimeout(ms)` fixo |
| Auth expirada | Cookie setado antes de cada teste via helper |
| Rede lenta | `actionTimeout: 10000`, `navigationTimeout: 15000` |
| Ordem de execução | Specs independentes — sem dependência de ordem |
| Captcha | Desabilitado via ausência de `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |
| Asaas lento | `page.route()` nos testes que não testam pagamento |
| Dados residuais | Reset antes da suite; e-mails únicos por spec |
| Falhas intermitentes | `retries: 2` no CI, `retries: 1` local |

### Config em `playwright.config.ts`

```typescript
{
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 4,
  use: {
    baseURL: 'http://localhost:3300',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
}
```

---

## 10. CI Pipeline — GitHub Actions

### `.github/workflows/e2e.yml`

```yaml
name: E2E Tests
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  SUPABASE_PROJECT_REF: ${{ secrets.TEST_SUPABASE_PROJECT_REF }}
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  DIRECT_URL: ${{ secrets.TEST_DIRECT_URL }}
  ASAAS_API_KEY: ${{ secrets.TEST_ASAAS_API_KEY }}
  ASAAS_ENVIRONMENT: ${{ secrets.TEST_ASAAS_ENVIRONMENT }}
  ASAAS_ACCESS_TOKEN: ${{ secrets.TEST_ASAAS_ACCESS_TOKEN }}
  ASAAS_WALLET_ID: ${{ secrets.TEST_ASAAS_WALLET_ID }}
  NEXT_PUBLIC_APP_URL: ${{ secrets.TEST_NEXT_PUBLIC_APP_URL }}

jobs:
  e2e:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm db:generate

      - name: Install Playwright browsers
        run: pnpm --filter @cuidly/e2e exec playwright install --with-deps chromium

      - name: Write .env.test for E2E scripts
        working-directory: packages/e2e
        run: |
          cat > .env.test <<EOF
          NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
          NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
          SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
          SUPABASE_PROJECT_REF=${SUPABASE_PROJECT_REF}
          DATABASE_URL=${DATABASE_URL}
          DIRECT_URL=${DIRECT_URL}
          ASAAS_API_KEY=${ASAAS_API_KEY}
          ASAAS_ENVIRONMENT=${ASAAS_ENVIRONMENT}
          ASAAS_ACCESS_TOKEN=${ASAAS_ACCESS_TOKEN}
          ASAAS_WALLET_ID=${ASAAS_WALLET_ID}
          NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
          EOF

      - name: Write .env.local for app build
        working-directory: apps/app
        run: |
          cat > .env.local <<EOF
          NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
          NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
          SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
          DATABASE_URL=${DATABASE_URL}
          DIRECT_URL=${DIRECT_URL}
          ASAAS_API_KEY=${ASAAS_API_KEY}
          ASAAS_ENVIRONMENT=${ASAAS_ENVIRONMENT}
          ASAAS_ACCESS_TOKEN=${ASAAS_ACCESS_TOKEN}
          ASAAS_WALLET_ID=${ASAAS_WALLET_ID}
          NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
          EOF

      - name: Reset test database
        run: pnpm e2e:reset-db

      - name: Create test users and seed data
        run: pnpm e2e:create-users

      - name: Build app
        run: pnpm build:app

      - name: Run E2E tests
        run: |
          pnpm --filter @cuidly/app start -- -p 3300 &
          APP_PID=$!
          npx wait-on http://localhost:3300 --timeout 120000
          pnpm e2e
          EXIT_CODE=$?
          kill $APP_PID 2>/dev/null || true
          exit $EXIT_CODE

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: packages/e2e/playwright-report/
          retention-days: 14

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-traces
          path: packages/e2e/test-results/
          retention-days: 7
```

### GitHub Secrets necessários

| Secret | Descrição |
|--------|-----------|
| `TEST_NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase de teste |
| `TEST_NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do projeto de teste |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | Service role key do projeto de teste |
| `TEST_SUPABASE_PROJECT_REF` | Project ref do Supabase de teste |
| `TEST_DATABASE_URL` | Connection string do banco de teste (pooler) |
| `TEST_DIRECT_URL` | Connection string direta do banco de teste |
| `TEST_ASAAS_API_KEY` | API key do Asaas sandbox |
| `TEST_ASAAS_ENVIRONMENT` | Environment do Asaas (sandbox) |
| `TEST_ASAAS_ACCESS_TOKEN` | Token de validação do webhook |
| `TEST_ASAAS_WALLET_ID` | Wallet ID do Asaas sandbox |
| `TEST_NEXT_PUBLIC_APP_URL` | URL da app (http://localhost:3300) |

### Otimizações futuras

- Cache do build do Next.js entre runs
- Paralelizar specs com `workers > 1` no CI
- Sharding: `--shard=1/4` para distribuir entre jobs
- Rodar apenas specs afetados por mudanças

---

## 11. Fases de Implementação

### Fase 1 — Setup Básico [CONCLUIDA]

**Objetivo:** Test runner rodando com um teste smoke.

- [x] Criar `packages/e2e/` com `package.json`, `tsconfig.json`
- [x] Configurar `baseUrl: http://localhost:3300`
- [x] Criar `.env.test.example` com placeholders
- [x] Criar seed: `seed/test-seed.ts`
- [x] Criar scripts: `reset-test-db.ts`, `create-test-users.ts`
- [x] Adicionar scripts ao root `package.json`
- [x] Atualizar `.gitignore` para e2e scripts e artifacts

### Fase 2 — Infra de Testes [CONCLUIDA]

**Objetivo:** Login programático + reset de banco funcionando.

- [x] Criar projeto Supabase de teste (separado)
- [x] Criar `.env.test` com credenciais do projeto de teste
- [x] Testar `pnpm e2e:reset-db` — trunca o banco de teste
- [x] Testar `pnpm e2e:create-users` — cria 4 usuários no Supabase + Prisma
- [x] Migrar de Cypress para Playwright (Cypress incompatível com WSL2)
- [x] Implementar `playwright.config.ts`
- [x] Implementar `tests/helpers/auth.ts` com login programático via cookie Supabase SSR
- [x] Implementar `tests/helpers/webhook.ts` com simulação de webhook
- [x] Escrever spec: `tests/auth/login.spec.ts` (4 logins programáticos + login via UI + erro)
- [x] Escrever spec: `tests/public/landing.spec.ts` (smoke test)

### Fase 3 — Primeiros Fluxos Críticos [CONCLUIDA]

**Objetivo:** Cobrir os fluxos de maior valor de negócio.

- [x] **Auth:** Cadastro — `tests/auth/signup.spec.ts`
- [x] **Família:** Buscar babás — `tests/family/search-nannies.spec.ts`
- [x] **Família:** Criar vaga — `tests/family/create-job.spec.ts`
- [x] **Família:** Ver candidaturas — `tests/family/view-applications.spec.ts`
- [x] **Babá:** Ver vagas — `tests/nanny/view-jobs.spec.ts`
- [x] **Babá:** Candidatar-se a vaga — `tests/nanny/apply-job.spec.ts`
- [x] **Chat:** Conversas — `tests/chat/conversation.spec.ts`
- [x] **Público:** Perfil público de babá — `tests/public/nanny-profile.spec.ts`

### Fase 4 — Cobertura de Pagamento [CONCLUIDA]

**Objetivo:** Testar fluxos de assinatura e pagamento.

- [x] Página de assinatura — `tests/subscription/subscription-page.spec.ts`
- [x] Upgrade família — `tests/subscription/family-upgrade.spec.ts`
- [x] Upgrade babá — `tests/subscription/nanny-upgrade.spec.ts`
- [x] Feature gates (free vs paid) — `tests/subscription/feature-gates.spec.ts`
- [x] Webhook simulado — `tests/subscription/webhook.spec.ts`
- [x] Cancelamento — `tests/subscription/cancellation.spec.ts`

### Fase 5 — CI/CD [CONCLUIDA]

**Objetivo:** Testes rodando automaticamente em PRs.

- [x] Criar `.github/workflows/e2e.yml`
- [x] Pipeline: checkout → install → prisma generate → playwright install → write envs → reset DB → seed → build → start → run E2E → artifacts
- [x] Upload de report (sempre) e traces (em falha) como artifacts
- [ ] Configurar GitHub Secrets (pendente deploy)
- [ ] Validar pipeline em 3 PRs consecutivos
- [ ] Status check obrigatório no branch `main`

---

## 12. Riscos Técnicos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Teste acessa banco de produção | Catastrófico | Baixa | Safety check no script (rejeita URLs sem project ref de teste); `.env.test` separado; CI usa secrets dedicados |
| Supabase Auth SSR cookies mudam | Alto | Média | Lógica de auth encapsulada em `tests/helpers/auth.ts`; monitorar releases do `@supabase/ssr` |
| Asaas sandbox instável | Médio | Alta | `page.route()` para maioria dos testes; sandbox real apenas em suite separada |
| Seed lento no CI | Médio | Média | `TRUNCATE CASCADE` via raw SQL; seed mínimo (4 usuários) |
| Next.js 16 breaking changes | Alto | Baixa | Versão pinnada; upgrades em branch separada |
| Custos do Supabase de teste | Baixo | Baixa | Free tier do Supabase é suficiente |
| Dados poluem entre specs | Médio | Média | E-mails únicos por spec; reset completo antes da suite |
| Webhook handler muda de contrato | Médio | Média | Fixtures tipadas; validar contra schema real |

---

## 13. Definition of Done

### Por Fase

**Fase 1 — Setup Básico:**
- [x] Teste smoke passa (landing page carrega)
- [x] Configuração documentada no `.env.test.example`

**Fase 2 — Infra:**
- [x] `pnpm e2e:reset-db` trunca o banco de teste
- [x] `login('family')` autentica e acessa o dashboard
- [x] `login('nanny')` autentica e acessa o dashboard

**Fase 3 — Fluxos Críticos:**
- [x] 8+ specs cobrindo: auth, busca, vaga, candidatura, chat, perfil público
- [x] Zero `page.waitForTimeout(ms)` fixo

**Fase 4 — Pagamento:**
- [x] Webhook simulado testa handler real
- [x] Feature gates testados (free vs paid)
- [x] Fluxo de cancelamento testado

**Fase 5 — CI:**
- [x] Workflow GitHub Actions criado
- [ ] Pipeline validado em 3 PRs consecutivos
- [ ] Status check bloqueando merge

### Critérios globais

- Zero acesso a dados de produção (safety check no reset-db)
- Helpers tipados com TypeScript
- Specs independentes entre si (executáveis em qualquer ordem)

---

## Referência: Arquivos Críticos do Projeto

| Arquivo | Relevância |
|---------|-----------|
| `apps/app/src/components/auth/TurnstileWidget.tsx` | Captcha bypass (retorna null sem env var) |
| `apps/app/src/utils/supabase/server.ts` | `createAdminClient()` para service role |
| `apps/app/src/utils/supabase/middleware.ts` | Cookie handling SSR (getAll/setAll) |
| `apps/app/src/lib/payment/asaas-gateway.ts` | Alterna sandbox/prod via `ASAAS_ENVIRONMENT` |
| `apps/app/src/app/api/webhooks/payment/route.ts` | Webhook handler (valida `asaas-access-token` header) |
| `apps/app/src/app/(auth)/login/page.tsx` | Login flow (e-mail/senha + OAuth) |
| `apps/app/src/app/(authenticated)/app/layout.tsx` | Layout protegido (redireciona para /login se sem sessão) |
| `packages/database/prisma/schema.prisma` | Schema completo do banco (@@map para nomes SQL) |
| `packages/core/src/subscriptions/` | Pricing, features, plans, billing |

---

## Nota Histórica: Migração Cypress → Playwright

O Cypress foi descartado porque o binário Electron embutido (usado para o smoke test interno) falha no WSL2 com `bad option: --no-sandbox`. O problema ocorre antes mesmo de o Cypress abrir qualquer browser — é um blocker no ambiente Linux/WSL2.

O Playwright não tem esse problema porque gerencia seus próprios browsers (Chromium headless shell) sem depender do Electron.

**O que foi mantido da implementação original:**
- Scripts de seed/reset (`reset-test-db.ts`, `create-test-users.ts`)
- Dados de teste (`seed/test-seed.ts`)
- Variáveis de ambiente (`.env.test`, `.env.test.example`)
- Estrutura de pastas e convenções

**O que mudou:**
- `cypress` → `@playwright/test` no `package.json`
- `cypress.config.ts` → `playwright.config.ts`
- `cypress/e2e/**/*.cy.ts` → `tests/**/*.spec.ts`
- `cypress/support/commands.ts` → `tests/helpers/auth.ts` + `tests/helpers/webhook.ts`
- `cy.session()` → cookie injection via `context.addCookies()`
- `cy.visit()` / `cy.get()` → `page.goto()` / `page.locator()`
- `cy.intercept()` → `page.route()`
