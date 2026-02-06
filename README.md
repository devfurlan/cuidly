# Cuidly

Plataforma para conectar famílias e babás.

## Estrutura do Projeto

```
cuidly/
├── apps/
│   ├── app/          # Aplicação principal (Next.js)
│   └── admin/        # Painel administrativo (Next.js)
├── packages/
│   └── database/     # Schema Prisma e configurações
└── turbo.json        # Configuração do Turborepo
```

## Requisitos

- Node.js 18+
- PostgreSQL
- Conta Supabase (Auth + Storage)

## Configuração Inicial

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie os arquivos `.env.example` para `.env` em cada app e configure:

**apps/app/.env:**
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**apps/admin/.env:**
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
```

### 3. Configurar Supabase Storage

Crie os seguintes buckets no Supabase Dashboard (Storage):

#### Bucket: `review-photos`
- **Finalidade**: Armazenar fotos enviadas nas avaliações
- **Public**: Sim
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

**Políticas de acesso (RLS):**

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload review photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-photos');

-- Permitir leitura pública
CREATE POLICY "Public read access for review photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-photos');

-- Permitir delete para usuários autenticados
CREATE POLICY "Users can delete their own review photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-photos');
```

#### Bucket: `documents`
- **Finalidade**: Armazenar documentos de validação (CPF, RG, certidões, comprovantes)
- **Public**: Não (privado)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`

**Políticas de acesso (RLS):**

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Permitir leitura apenas para o próprio usuário (baseado no path)
CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir delete para o próprio usuário
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Bucket: `profile-photos`
- **Finalidade**: Armazenar fotos de perfil de babás e famílias
- **Public**: Sim
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

**Estrutura de pastas:**
- `nannies/{auth_id}/{timestamp}-{random}.jpg` - Fotos de babás
- `families/{auth_id}/{timestamp}-{random}.jpg` - Fotos de famílias

**Políticas de acesso (RLS):**

```sql
-- Permitir upload para usuários autenticados (na sua própria pasta)
CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Permitir leitura pública (fotos de perfil são públicas)
CREATE POLICY "Public read access for profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Permitir update para o próprio usuário (upsert)
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Permitir delete para o próprio usuário
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

**Nota sobre a estrutura de pastas:**
- O path segue o formato: `{tipo}/{auth_id}/{arquivo}`
- Exemplo: `nannies/550e8400-e29b-41d4-a716-446655440000/1702678400000-abc123.jpg`
- A policy usa `(storage.foldername(name))[2]` para extrair o `auth_id` (segundo nível da pasta)
- O `auth_id` corresponde ao `auth.uid()` do Supabase Auth (UUID do usuário autenticado)

### 4. Configurar Supabase Realtime

O Supabase Realtime permite atualizações em tempo real via WebSocket. Para funcionar, é necessário habilitar Realtime nas tabelas que precisam de updates instantâneos.

#### Tabelas com Realtime Habilitado

| Tabela | Eventos | Uso |
|--------|---------|-----|
| `notifications` | INSERT, UPDATE | Notificações em tempo real |
| `messages` | INSERT | Mensagens do chat |
| `conversations` | UPDATE | Status de conversas |

#### Como Habilitar

1. Acesse o **Supabase Dashboard**
2. Vá para **Database > Replication**
3. Na seção "Realtime", clique no número de tabelas
4. Marque as checkboxes das tabelas listadas acima
5. Clique em **Save**

**Alternativamente, via SQL:**

```sql
-- Adicionar tabelas à publicação Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

**Verificar configuração:**

```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

Deve retornar as tabelas `notifications`, `messages` e `conversations`.

### 5. Executar migrations

```bash
pnpm db:migrate
```

### 6. Gerar Prisma Client

```bash
pnpm db:generate
```

### 7. Executar seed (opcional)

```bash
cd packages/database
pnpm exec prisma db seed
```

## Desenvolvimento

### Iniciar todos os apps

```bash
pnpm dev
```

### Iniciar app específico

```bash
# App principal
pnpm dev:app

# Admin
pnpm dev:admin
```

### Build

```bash
pnpm build
```

## Testes

O projeto possui uma suíte de testes automatizados para validar as regras de negócio principais.

### Executar testes

```bash
# Executar todos os testes
pnpm test

# Executar em modo watch (re-executa ao salvar)
pnpm test:watch

# Executar com cobertura de código
pnpm test:coverage
```

### Estrutura dos testes

Os testes estão localizados em `apps/app/src/__tests__/` e cobrem:

**Regras de Planos de Família:**
- Limites de conversas por vaga (3 para FREE, ilimitado para PLUS)
- Expiração de vagas (7 dias para FREE, 30 dias para PLUS)
- Cálculo correto de dias restantes

**Sistema de Boost:**
- Verificação de boosts ativos
- Contagem de boosts disponíveis por período

**Regras de Mensagens para Babás:**
- Sistema de turnos para plano FREE (aguarda resposta da família)
- Mensagens ilimitadas para plano PRO

### Arquivos de teste

- `business-rules.test.ts` - Testes das regras de negócio (15 testes)
- `factories.ts` - Factories para criação de mocks

## Estrutura do Banco de Dados

### Principais Models

- **AdminUser**: Usuários administradores do painel admin
- **Family**: Perfil de família (com `authId` vinculado ao Supabase Auth)
- **Nanny**: Perfil de babá (com `authId` vinculado ao Supabase Auth)
- **Child**: Crianças vinculadas a famílias
- **Review**: Avaliações bidirecionais (estilo Airbnb)
- **Notification**: Notificações in-app
- **ModerationLog**: Histórico de moderações de avaliações
- **Conversation/Message**: Sistema de chat entre famílias e babás

### Sistema de Avaliações

O sistema de avaliações é bidirecional (estilo Airbnb):

1. **FAMILY_TO_NANNY**: Família avalia a babá
   - Categorias: pontualidade, cuidado, comunicação, confiabilidade

2. **NANNY_TO_FAMILY**: Babá avalia a família
   - Categorias: comunicação, respeito, ambiente, pagamento

**Fluxo de publicação:**
- Avaliações ficam pendentes até ambas as partes avaliarem
- Após 14 dias, são publicadas automaticamente (cron job)
- Lembrete enviado após 7 dias

## Permissões de Admin

O sistema de admin usa permissões granulares:

- `NANNIES`: Gerenciar babás
- `FAMILIES`: Gerenciar famílias
- `CHILDREN`: Gerenciar crianças
- `SUBSCRIPTIONS`: Gerenciar assinaturas
- `ADMIN_USERS`: Gerenciar administradores
- `REVIEWS`: Moderar avaliações

## Cron Jobs

### Publicação automática de avaliações

Endpoint: `/api/cron/publish-reviews`

- Envia lembretes para contatos com 7 dias
- Publica avaliações de contatos com 14+ dias

Configure um cron job para chamar este endpoint diariamente.

## Seguranca

### Variaveis de Ambiente Obrigatorias

Alem das variaveis basicas, configure as seguintes para seguranca:

```env
# Criptografia de dados sensiveis (CPF)
# Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CPF_ENCRYPTION_KEY="sua_chave_de_64_caracteres_hex"

# Salt para hash de busca de CPF
CPF_HASH_SALT="um_salt_aleatorio_seguro"

# Secret para autenticacao de cron jobs
CRON_SECRET="seu_secret_para_cron_jobs"

# Secret para validacao de webhooks de pagamento (Asaas)
ASAAS_WEBHOOK_SECRET="secret_fornecido_pelo_asaas"
```

### Geracao de Chaves

```bash
# Gerar ENCRYPTION_KEY (64 caracteres hex = 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar CRON_SECRET ou CPF_HASH_SALT
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

### Recursos de Seguranca Implementados

#### Protecao CSRF
- Double Submit Cookie pattern
- Validacao de Origin/Referer headers
- Middleware automatico em `/middleware.ts`

#### Criptografia de Dados Sensiveis
- CPF criptografado com AES-256-GCM no banco de dados
- Hash SHA-256 para buscas sem expor dados
- Middleware Prisma automatico (ativado quando `ENCRYPTION_KEY` esta configurada)

#### Autenticacao e Autorizacao
- Todos os endpoints de API requerem autenticacao via Supabase
- Verificacao de ownership (usuario so acessa seus proprios dados)
- Admins tem acesso elevado quando necessario

#### Validacao de Uploads
- Validacao de magic bytes (assinatura real do arquivo)
- Whitelist de tipos MIME permitidos
- Limite de tamanho por tipo de arquivo

#### Protecao contra XSS
- Sanitizacao HTML com whitelist de tags/atributos
- Usado em todos os `dangerouslySetInnerHTML`

#### Rate Limiting
- Limite de requisicoes por IP
- Protecao especial para endpoints sensiveis (login, reset senha)

#### Webhooks Seguros
- Validacao de assinatura HMAC-SHA256 para webhooks de pagamento
- Comparacao timing-safe para prevenir timing attacks

#### Cron Jobs Seguros
- Autenticacao via Bearer token
- Comparacao timing-safe do secret

#### Headers de Seguranca
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy

### Configuracao de APIs Externas

#### Google Maps API
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em APIs & Services > Credentials
3. Edite sua API key
4. Em "Application restrictions", selecione "HTTP referrers"
5. Adicione seus dominios:
   - `https://cuidly.com/*`
   - `https://www.cuidly.com/*`
   - `http://localhost:3000/*` (dev)

#### reCAPTCHA
1. Acesse [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Selecione seu site
3. Em "Domains", adicione apenas seus dominios de producao

### Checklist de Deploy

- [ ] Todas as variaveis de ambiente configuradas
- [ ] `ENCRYPTION_KEY` gerada e salva com seguranca
- [ ] `CRON_SECRET` configurado
- [ ] `ASAAS_WEBHOOK_SECRET` configurado
- [ ] APIs externas com restricao de dominio
- [ ] `.env` e `.env.prod` **NAO** commitados no git
- [ ] HTTPS habilitado em producao

## Segurança do Banco de Dados - Row Level Security (RLS)

O Supabase usa PostgreSQL com Row Level Security (RLS) para garantir que usuários só acessem dados autorizados. **É CRÍTICO** habilitar RLS em todas as tabelas após rodar as migrations.

### Tabelas Cobertas (24 total)

| Categoria | Tabelas |
|-----------|---------|
| **Usuários** | `admin_users`, `nannies`, `families`, `children`, `addresses`, `documents`, `children_families`, `references`, `nanny_availabilities` |
| **Assinaturas/Pagamentos** | `plans`, `subscriptions`, `payments`, `coupons`, `coupon_usages`, `boosts` |
| **Vagas** | `jobs`, `job_applications` |
| **Analytics** | `favorites`, `profile_analytics`, `user_profile_views`, `bio_cache` |
| **Chat** | `conversations`, `participants`, `messages` |
| **Avaliações/Moderação** | `reviews`, `notifications`, `moderation_logs`, `audit_logs` |
| **Validação** | `validation_requests`, `document_uploads` |

| Storage Buckets |
|-----------------|
| `review-photos`, `documents`, `profile-photos` |

### Script Completo Consolidado

**Copie e execute este script único no Supabase SQL Editor após rodar as migrations do Prisma.**

```sql
-- ============================================
-- SCRIPT COMPLETO DE RLS E STORAGE - CUIDLY
-- ============================================
-- Execute este script no Supabase SQL Editor após rodar as migrations do Prisma
-- Última atualização: 2025-12-22

-- ============================================
-- PARTE 1: LIMPAR POLÍTICAS EXISTENTES
-- ============================================

-- Tabelas principais
DROP POLICY IF EXISTS "Backend only access" ON admin_users;
DROP POLICY IF EXISTS "Backend only access" ON nannies;
DROP POLICY IF EXISTS "Backend only access" ON families;
DROP POLICY IF EXISTS "Backend only access" ON children;
DROP POLICY IF EXISTS "Backend only access" ON addresses;
DROP POLICY IF EXISTS "Backend only access" ON documents;
DROP POLICY IF EXISTS "Backend only access" ON children_families;
DROP POLICY IF EXISTS "Backend only access" ON "references";
DROP POLICY IF EXISTS "Backend only access" ON nanny_availabilities;

-- Tabelas de assinatura e pagamento
DROP POLICY IF EXISTS "Backend only access" ON plans;
DROP POLICY IF EXISTS "Backend only access" ON subscriptions;
DROP POLICY IF EXISTS "Backend only access" ON payments;
DROP POLICY IF EXISTS "Backend only access" ON coupons;
DROP POLICY IF EXISTS "Backend only access" ON coupon_usages;
DROP POLICY IF EXISTS "Backend only access" ON boosts;

-- Tabelas de vagas
DROP POLICY IF EXISTS "Backend only access" ON jobs;
DROP POLICY IF EXISTS "Backend only access" ON job_applications;

-- Tabelas de favoritos e analytics
DROP POLICY IF EXISTS "Backend only access" ON favorites;
DROP POLICY IF EXISTS "Backend only access" ON profile_analytics;
DROP POLICY IF EXISTS "Backend only access" ON user_profile_views;
DROP POLICY IF EXISTS "Backend only access" ON bio_cache;

-- Tabelas de chat
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Backend only insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON participants;
DROP POLICY IF EXISTS "Backend only insert participants" ON participants;
DROP POLICY IF EXISTS "Only backend can insert participants" ON participants;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON messages;

-- Tabelas de avaliações e moderação
DROP POLICY IF EXISTS "Backend only access" ON reviews;
DROP POLICY IF EXISTS "Backend only access" ON notifications;
DROP POLICY IF EXISTS "Backend only access" ON moderation_logs;
DROP POLICY IF EXISTS "Backend only access" ON audit_logs;

-- Tabelas de validação
DROP POLICY IF EXISTS "Backend only access" ON validation_requests;
DROP POLICY IF EXISTS "Backend only access" ON document_uploads;

-- Storage policies
DROP POLICY IF EXISTS "Authenticated users can upload review photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for review photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own review photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;

-- ============================================
-- PARTE 2: HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

-- Tabelas principais de usuários
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nannies ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE "references" ENABLE ROW LEVEL SECURITY;
ALTER TABLE nanny_availabilities ENABLE ROW LEVEL SECURITY;

-- Tabelas de assinatura e pagamento
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;

-- Tabelas de vagas
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Tabelas de favoritos e analytics
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_cache ENABLE ROW LEVEL SECURITY;

-- Tabelas de chat
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Tabelas de avaliações e moderação
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tabelas de validação
ALTER TABLE validation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 3: POLÍTICAS BACKEND ONLY
-- ============================================
-- Estas tabelas são acessadas apenas via API (service_role)
-- Bloqueamos acesso direto do cliente para maior segurança

CREATE POLICY "Backend only access" ON admin_users
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON nannies
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON families
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON children
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON addresses
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON documents
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON children_families
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON "references"
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON nanny_availabilities
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON plans
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON subscriptions
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON payments
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON coupons
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON coupon_usages
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON boosts
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON jobs
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON job_applications
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON favorites
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON profile_analytics
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON user_profile_views
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON bio_cache
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON reviews
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON notifications
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON moderation_logs
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON audit_logs
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON validation_requests
FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "Backend only access" ON document_uploads
FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ============================================
-- PARTE 4: POLÍTICAS PARA CHAT (Acesso direto)
-- ============================================
-- O chat usa Supabase Realtime, então precisa de políticas
-- que permitam acesso direto do cliente
-- NOTA: participants usa nanny_id e family_id (não user_id)
-- As políticas verificam se o auth.uid() corresponde ao auth_id de uma nanny ou family

-- Função auxiliar para verificar se o usuário participa da conversa
-- (precisa ser criada antes das políticas)
CREATE OR REPLACE FUNCTION user_participates_in_conversation(conv_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM participants p
    LEFT JOIN nannies n ON p.nanny_id = n.id
    LEFT JOIN families f ON p.family_id = f.id
    WHERE p.conversation_id = conv_id
    AND (n.auth_id = auth.uid() OR f.auth_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conversations
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
TO authenticated
USING (user_participates_in_conversation(id));

CREATE POLICY "Backend only insert conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (false);

-- Participants
CREATE POLICY "Users can view participants of their conversations"
ON participants FOR SELECT
TO authenticated
USING (user_participates_in_conversation(conversation_id));

CREATE POLICY "Backend only insert participants"
ON participants FOR INSERT
TO authenticated
WITH CHECK (false);

-- Messages
CREATE POLICY "Users can view messages from their conversations"
ON messages FOR SELECT
TO authenticated
USING (user_participates_in_conversation(conversation_id));

CREATE POLICY "Users can send messages to their conversations"
ON messages FOR INSERT
TO authenticated
WITH CHECK (user_participates_in_conversation(conversation_id));

CREATE POLICY "Users can mark received messages as read"
ON messages FOR UPDATE
TO authenticated
USING (user_participates_in_conversation(conversation_id))
WITH CHECK (user_participates_in_conversation(conversation_id));

-- ============================================
-- PARTE 5: ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_participants_nanny_id ON participants(nanny_id);
CREATE INDEX IF NOT EXISTS idx_participants_family_id ON participants(family_id);
CREATE INDEX IF NOT EXISTS idx_participants_conversation_id ON participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_nanny_id ON messages(sender_nanny_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_family_id ON messages(sender_family_id);
CREATE INDEX IF NOT EXISTS idx_nannies_auth_id ON nannies(auth_id);
CREATE INDEX IF NOT EXISTS idx_families_auth_id ON families(auth_id);

-- ============================================
-- PARTE 6: POLÍTICAS PARA STORAGE
-- ============================================

-- Bucket: review-photos
CREATE POLICY "Authenticated users can upload review photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-photos');

CREATE POLICY "Public read access for review photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-photos');

CREATE POLICY "Users can delete their own review photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-photos');

-- Bucket: documents (privado)
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket: profile-photos
CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Public read access for profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- =============================================================
-- BACKFILL: Chat Scalability Migration
-- Run this after the schema migration to populate new fields
-- =============================================================

-- 1. Backfill seq for existing messages (ordered by created_at)
WITH numbered_messages AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at, id) as rn
  FROM messages
  WHERE seq IS NULL
)
UPDATE messages m
SET seq = nm.rn
FROM numbered_messages nm
WHERE m.id = nm.id;

-- 2. Update sequence to continue from max value (mínimo 1 para evitar erro)
SELECT setval('messages_seq_seq', GREATEST(COALESCE((SELECT MAX(seq) FROM messages), 0), 1));

-- 3. Backfill last_message_* fields on conversations
UPDATE conversations c
SET
  last_message_at = m.created_at,
  last_message_id = m.id,
  last_message_preview = LEFT(m.body, 100)
FROM (
  SELECT DISTINCT ON (conversation_id)
    conversation_id,
    id,
    body,
    created_at
  FROM messages
  WHERE deleted_at IS NULL
  ORDER BY conversation_id, created_at DESC
) m
WHERE c.id = m.conversation_id;

-- 4. Backfill last_read_at on participants (set to last message time as initial state)
UPDATE participants p
SET
  last_read_at = subq.last_message_at,
  last_read_message_id = subq.last_message_id
FROM (
  SELECT
    p.id as participant_id,
    (
      SELECT m.created_at FROM messages m
      WHERE m.conversation_id = p.conversation_id
        AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT 1
    ) as last_message_at,
    (
      SELECT m.id FROM messages m
      WHERE m.conversation_id = p.conversation_id
        AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT 1
    ) as last_message_id
  FROM participants p
) subq
WHERE p.id = subq.participant_id
  AND subq.last_message_at IS NOT NULL;

-- 5. Add check constraint for exactly one sender
ALTER TABLE messages
ADD CONSTRAINT messages_exactly_one_sender
CHECK (
  (sender_nanny_id IS NOT NULL)::int + (sender_family_id IS NOT NULL)::int = 1
);

-- 6. Verify backfill results
SELECT 'Messages with seq' as check_name, COUNT(*) as count FROM messages WHERE seq IS NOT NULL
UNION ALL
SELECT 'Messages without seq', COUNT(*) FROM messages WHERE seq IS NULL
UNION ALL
SELECT 'Conversations with last_message_at', COUNT(*) FROM conversations WHERE last_message_at IS NOT NULL
UNION ALL
SELECT 'Participants with last_read_at', COUNT(*) FROM participants WHERE last_read_at IS NOT NULL;

-- ============================================
-- PARTE 7: HABILITAR SUPABASE REALTIME
-- ============================================
-- Adiciona tabelas à publicação Realtime para permitir
-- atualizações em tempo real via WebSocket

-- Configurar REPLICA IDENTITY FULL para que o Realtime envie todos os campos
-- (necessário para postgres_changes funcionar corretamente)
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verificar se as tabelas foram adicionadas corretamente:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================
-- PARTE 8: CUPONS DE WIN-BACK (Cancelamento)
-- ============================================
-- Esses cupons são usados na régua de e-mails de cancelamento
-- para oferecer desconto aos usuários que cancelaram o plano.
-- O cron job de cancellation-emails adiciona automaticamente
-- o e-mail do usuário à lista de permitidos quando envia o e-mail.

-- Cupom para FAMÍLIAS (Cuidly Plus)
INSERT INTO coupons (
  id,
  code,
  description,
  discount_type,
  discount_value,
  applicable_to,
  has_user_restriction,
  start_date,
  end_date,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'VOLTE-FAMILIA',
  'Cupom de win-back para famílias que cancelaram o plano. 20% de desconto na primeira mensalidade ao reativar.',
  'PERCENTAGE',
  20,
  'FAMILIES',
  true,
  NOW(),
  NOW() + INTERVAL '5 years',
  true,
  NOW(),
  NOW()
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  applicable_to = EXCLUDED.applicable_to,
  has_user_restriction = EXCLUDED.has_user_restriction,
  updated_at = NOW();

-- Cupom para BABÁS (Cuidly Pro)
INSERT INTO coupons (
  id,
  code,
  description,
  discount_type,
  discount_value,
  applicable_to,
  has_user_restriction,
  start_date,
  end_date,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'VOLTE-BABA',
  'Cupom de win-back para babás que cancelaram o plano. 20% de desconto na primeira mensalidade ao reativar.',
  'PERCENTAGE',
  20,
  'NANNIES',
  true,
  NOW(),
  NOW() + INTERVAL '5 years',
  true,
  NOW(),
  NOW()
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  applicable_to = EXCLUDED.applicable_to,
  has_user_restriction = EXCLUDED.has_user_restriction,
  updated_at = NOW();

-- Verificar se os cupons foram criados:
-- SELECT code, description, discount_value, applicable_to, is_active FROM coupons WHERE code IN ('VOLTE-FAMILIA', 'VOLTE-BABA');
```

### Verificar Status do RLS

Após executar o script, verifique se todas as tabelas estão com RLS habilitado:

```sql
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Todas as tabelas devem ter rls_enabled = true
```

### Por que Backend Only?

A maioria das tabelas usa política "Backend only" porque:

1. **Segurança**: O cliente nunca acessa dados diretamente - todas as requisições passam pela API do Next.js que usa `service_role`
2. **Validação**: A API valida permissões, ownership e regras de negócio antes de acessar o banco
3. **Auditoria**: Todas as operações são logadas e rastreáveis
4. **Simplicidade**: Evita duplicação de lógica de autorização no banco e na API

O `service_role` do Supabase **bypassa RLS**, então a API continua funcionando normalmente.

### Tabelas com Acesso Direto (Chat)

Apenas as tabelas de chat (`conversations`, `participants`, `messages`) permitem acesso direto do cliente porque usam Supabase Realtime para atualizações em tempo real. As políticas garantem que:

- Usuários só veem conversas das quais participam
- Usuários só podem enviar mensagens em suas conversas
- Usuários só podem marcar como lidas mensagens que receberam

### Testando as Políticas

```sql
-- Como usuário autenticado (anon key), todas estas queries devem retornar vazio:
SELECT * FROM admin_users;  -- Bloqueado
SELECT * FROM nannies;      -- Bloqueado
SELECT * FROM families;     -- Bloqueado
SELECT * FROM payments;     -- Bloqueado

-- Chat funciona se o usuário participa da conversa:
SELECT * FROM conversations;  -- Retorna apenas conversas do usuário
SELECT * FROM messages;       -- Retorna apenas mensagens das conversas do usuário

-- Tentar inserir em tabela bloqueada deve falhar:
INSERT INTO nannies (birth_date, phone_number) VALUES ('1990-01-01', '11999999999');
-- Erro esperado: new row violates row-level security policy
```

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime (Broadcast)
- **UI**: Tailwind CSS + shadcn/ui
- **Icons**: Phosphor Icons
- **Monorepo**: Turborepo
