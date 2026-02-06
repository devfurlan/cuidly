# Cuidly - Documentação de Planos de Assinatura

## Regras para o Claude

### Prisma / Banco de Dados
**NUNCA** executar comandos Prisma que alterem o banco de dados ou o schema:
- ❌ `prisma db push`
- ❌ `prisma db pull`
- ❌ `prisma migrate dev`
- ❌ `prisma migrate reset`
- ❌ `prisma migrate deploy`

Apenas o usuário executa esses comandos manualmente.

**Permitido:**
- ✅ Editar o arquivo `schema.prisma` manualmente
- ✅ Executar `prisma generate` (gera apenas o cliente, não altera BD)
- ✅ Executar `prisma validate` (apenas valida o schema)

### Privacidade da Babá

**NUNCA** exibir o nome completo da babá para famílias. **SEMPRE** usar apenas o primeiro nome.

- Use a função `getFirstName()` de `@/utils/slug` para extrair o primeiro nome
- Isso se aplica a: lista de conversas, chat, candidaturas, perfil público, etc.
- A babá pode ver seu próprio nome completo em seu perfil

```tsx
import { getFirstName } from '@/utils/slug';

// ✅ CORRETO - apenas primeiro nome para família
const displayName = nannyName ? getFirstName(nannyName) : 'Babá';

// ❌ ERRADO - nome completo exposto
const displayName = nanny.name;
```

### Primeiro Nome em E-mails

**SEMPRE** usar apenas o primeiro nome do usuário em templates de e-mail. **NUNCA** o nome completo.

- Isso vale para TODOS os e-mails: assinatura, cancelamento, PIX, renovação, etc.
- Use `name.split(' ')[0]` ao passar o nome para os templates

```tsx
// ✅ CORRETO - apenas primeiro nome
const emailTemplate = getWelcomeSubscriptionEmailTemplate({
  name: customerName.split(' ')[0],
  // ...
});

// ❌ ERRADO - nome completo
const emailTemplate = getWelcomeSubscriptionEmailTemplate({
  name: customerName,
  // ...
});
```

### Regras de Idioma

#### Código
- **Código sempre em inglês**: variáveis, funções, classes, comentários técnicos
- Exemplo: `emailAddress`, `sendEmail()`, `isEmailVerified`

#### Textos para o Usuário Final (Português Brasileiro)
- **Sempre em português brasileiro** com grafia e acentuação corretas
- **"e-mail"** (com hífen) - NUNCA "email"
- Usar acentuação correta: à, é, ê, ã, õ, ç, etc.

**Exemplos corretos:**
- ✅ "Seu e-mail foi verificado"
- ✅ "Digite seu e-mail"

**Exemplos incorretos:**
- ❌ "Seu email foi verificado"
- ❌ "Acesso a plataforma" (falta crase)

### Linguagem Neutra

**SEMPRE** usar linguagem neutra de gênero em todos os textos voltados ao usuário.

- Evitar "Bem-vindo/Bem-vinda" → usar "Boas-vindas" ou "Olá"
- Evitar "Obrigado/Obrigada" → usar "Agradecemos"
- Evitar pronomes de gênero quando possível
- Usar construções neutras que funcionem para qualquer pessoa

**Exemplos corretos:**
- ✅ "Boas-vindas à Cuidly!"
- ✅ "Olá, João!"
- ✅ "Agradecemos por assinar"
- ✅ "Você tem acesso a..."

**Exemplos incorretos:**
- ❌ "Bem-vindo ao plano!"
- ❌ "Obrigado por assinar"
- ❌ "Seja recomendada para mais vagas"

### Configuração de E-mails

- **Nome do remetente:** `Cuidly Babás`
- **Variável de ambiente:** `RESEND_FROM_EMAIL="Cuidly Babás <noreply@cuidly.com.br>"`

### Domínio da Cuidly

**SEMPRE** usar o domínio correto: `https://cuidly.com`

- ✅ `https://cuidly.com`
- ❌ `https://cuidly.com.br` (ERRADO - NÃO USAR)

Isso vale para:
- URLs em templates de e-mail
- Links de redirecionamento
- Referências ao site
- Qualquer URL da aplicação

---

# Planos

Este documento define os planos de assinatura, com preços promocionais de lançamento.

## 👨‍👩‍👧 PLANOS PARA FAMÍLIAS

### 🔹 Sem cadastro

**Objetivo:** curiosidade + gatilho de cadastro

✅ Ver perfis **incompletos** de babás
✅ Pode usar **apenas estes filtros**:
- Cidade
- Disponibilidade (dias da semana)
- Tipo de cuidado (folguista / diarista / mensalista)
- Tarifa / valor

❌ Não vê todas as babás
✅ Vê **quantidade total** de babás encontradas no filtro
❌ Não cria vaga
❌ Não conversa

Mensagem implícita:
*"Existem X babás que atendem o que você precisa. Cadastre-se para ver."*

### 🔹 Cuidly Free (Gratuito)

**Objetivo:** permitir testar, mas não resolver tudo

**Preço:** R$ 0/mês

✅ Ver **perfil completo** de babás
✅ Buscar e filtrar babás (**todos os filtros**)
✅ Ver **até 1 avaliação** por babá
✅ Criar **1 vaga ativa** (expira em 7 dias)
✅ Receber candidaturas na vaga
✅ Iniciar **1 conversa** (chat interno)
✅ Ver selos das babás (Identificada / Verificada / Confiável)
✅ Favoritar babás
✅ **Pode avaliar babás**

❌ Avaliações completas
❌ Chat ilimitado
❌ Matching inteligente
❌ Boost de vaga

Aqui a família **quase resolve**, mas:
- só pode conversar com 1 babá
- não vê histórico completo
→ ponto natural de upgrade

### 🔹 Cuidly Plus (Pago)

**Objetivo:** decisão + fechamento

**Mensal:** R$ 47 (Promo Lançamento) - *normal: R$ 59*
**Trimestral:** R$ 94 (Promo Lançamento) - *normal: R$ 119*

✅ **Tudo do Básico**
✅ **Matching inteligente**
✅ **Chat ilimitado**
✅ **1 Boost por mês** (vaga no topo por 7 dias)
✅ Criar até **3 vagas ativas** (30 dias)
✅ Ver **avaliações completas**
✅ Notificações de candidaturas

---

## 👶 PLANOS PARA BABÁS

### 🔹 Babá sem cadastro

**Objetivo:** conhecer a plataforma e despertar interesse em se cadastrar

✅ Ver **prévia** de vagas disponíveis
✅ Usar **filtros básicos** de vagas:
- Cidade
- Tipo de vaga (folguista / diarista / mensalista)
- Dias da semana
- Faixa de valor

❌ Ver detalhes completos da vaga
❌ Ver informações da família
❌ Candidatar-se a vagas
❌ Enviar mensagens
❌ Aparecer nas buscas
❌ Ter perfil público

**Mensagem implícita:**
"Existem vagas para você. Cadastre-se para criar seu perfil e se candidatar."

### 🔹 Cuidly Básico (Grátis)

**Objetivo:** permitir entrar no jogo, sem garantir contratação

**Preço:** R$ 0/mês

✅ Perfil completo (foto, experiência, certificados)
✅ **Selo Identificada**
✅ Ver vagas disponíveis
✅ Candidatar-se a vagas
✅ Enviar **Mensagem de Apresentação** (limite de caracteres) junto com a candidatura
✅ Responder no chat quando a família iniciar a conversa
✅ Avaliar famílias

❌ Iniciar conversas livremente
❌ Mensagens ilimitadas
❌ Selos Verificada / Confiável
❌ Perfil em destaque
❌ Matching prioritário

**Mensagem implícita:**
"Seu perfil já pode receber interesse. Para aumentar suas chances de contratação, faça upgrade."

### 🔹 Cuidly Pro (Pago)

**Objetivo:** aumentar visibilidade + chance real de contratação

**Mensal:** R$ 19/mês
**Anual:** R$ 119/ano

✅ **Tudo do plano Básico**
✅ Mensagens liberadas após candidatura (chat destravado)
✅ **Selo Verificada** (com assinatura ativa + elegibilidade)
✅ **Selo Confiável** (com assinatura ativa + elegibilidade)
✅ **Perfil em destaque** (aparece primeiro nas buscas)
✅ **Matching prioritário**

**Mensagem implícita:**
"Mais visibilidade, mais conversas, mais contratações."

---

## Selos e Verificações de Babás

| Selo | Requisitos | Plano |
|------|-----------|-------|
| **Identificada** | Perfil completo + documento de identidade (RG/CNH via Documentoscopia) + e-mail verificado | Grátis |
| **Verificada** | Identificada + validação facial + verificação de segurança | Pro |
| **Confiável** | Verificada + 3 avaliações | Pro |

### Definição de "Perfil Completo" para Selo Identificada

O perfil completo exige TODOS os seguintes campos preenchidos:

**Informações:**
- Nome, CPF, Data de nascimento, Gênero
- Foto de perfil
- Localização (bairro, cidade, estado)
- Sobre mim (texto de apresentação)

**Experiência:**
- Anos de experiência
- Faixas etárias de experiência
- Pontos fortes
- Atividades que aceita fazer

**Trabalho:**
- Tipo de babá (eventual, fixo, etc)
- Regime de contratação (CLT, MEI, etc)
- Faixa de valor por hora
- Máximo de crianças
- Raio de deslocamento

**Disponibilidade:**
- Grade de disponibilidade semanal

**Nota:** A validação de documento (RG/CNH) via BigDataCorp Documentoscopia é gratuita e parte do Selo Identificada.

---

## Arquivos de Configuração

Os planos estão configurados nos seguintes arquivos:

- **Preços:** `packages/core/src/subscriptions/pricing.ts`
- **Features:** `packages/core/src/subscriptions/features.ts`
- **Planos:** `packages/core/src/subscriptions/plans.ts`
- **Ciclos de Cobrança:** `packages/core/src/subscriptions/billing.ts`

---

## Comparativo com Concorrentes (Brasil)

| Dimensão | Cuidly | Sitly (BR) | Babysits (BR) |
|----------|--------|------------|---------------|
| Modelo | Vaga-first + matching | Perfil-first | Perfil-first |
| Criação de vaga | Sim (central) | Não | Não |
| Matching automático | Sim | Não | Não |
| Validação de identidade | Sim | Não | Não |
| Antecedentes criminais | Sim | Não | Não |
| Selos estruturados | Identificada / Verificada / Confiável | Não estruturado | Não estruturado |

### Preços - Famílias (Brasil)
| Plataforma | Plano grátis | Mensal (normal) | Trimestral |
|------------|--------------|-----------------|------------|
| **Cuidly** | Sim | R$ 59/mês | R$ 119/trimestre |
| Sitly | Sim | R$ 49/mês | R$ 99/trimestre |
| Babysits | Sim | ~R$ 39-59/mês | Varia |

### Preços - Babás (Brasil)
| Plataforma | Plano grátis | Mensal | Anual |
|------------|--------------|--------|-------|
| **Cuidly** | Sim | R$ 19/mês | R$ 119/ano |
| Sitly | Muito limitado | R$ 29/mês | R$ 57/trimestre |
| Babysits | Sim | Não cobra babás | - |

---

## Diferenciais Reais da Cuidly

**O que diferencia (não commodity):**
- Criação de vaga estruturada
- Matching automático orientado a vaga
- Validações (identidade + antecedentes)
- UX guiada (menos "garimpo")
- Modelo claro de confiança (selos)

**O que não diferencia (todo mundo tem):**
- Filtros avançados
- Notificações
- Avaliações
- Chat pago

---

## Convenções de UI/UX

### Componentes Reutilizáveis - USE SEMPRE

Antes de criar código inline para elementos visuais, **SEMPRE** verifique se já existe um componente:

| Elemento | Componente | Arquivo |
|----------|-----------|---------|
| Selo da Babá | `<SealBadge seal={seal} />` | `@/components/seals/SealBadge.tsx` |
| Badge genérico | `<Badge variant="..." />` | `@/components/ui/shadcn/badge.tsx` |
| Card | `<Card />` | `@/components/ui/shadcn/card.tsx` |
| Skeleton | `<Skeleton />` | `@/components/ui/shadcn/skeleton.tsx` |
| Modal de Upgrade (Babá) | `<NannyProUpsellModal />` | `@/components/subscription/nanny-pro-upsell-modal.tsx` |

### Upgrade de Assinatura

**NUNCA** usar `<Link href="/app/assinatura">` para upgrade. **SEMPRE** usar o modal de upsell:

```tsx
import { useState } from 'react';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';

// No componente:
const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

// Botão que abre o modal:
<Button onClick={() => setIsUpgradeModalOpen(true)}>
  Assinar Pro
</Button>

// Modal (no final do JSX):
<NannyProUpsellModal
  isOpen={isUpgradeModalOpen}
  onClose={() => setIsUpgradeModalOpen(false)}
  feature="validation" // ou "messages", "highlight", "general"
/>
```

**Features disponíveis:**
- `validation`: Para validação de documentos/antecedentes
- `messages`: Para mensagens ilimitadas
- `highlight`: Para perfil em destaque
- `general`: Para recursos genéricos Pro

### Selos da Babá (NannySeal)

**Arquivo de configuração:** `apps/app/src/lib/seals.ts`

| Selo | Cor | Ícone |
|------|-----|-------|
| IDENTIFICADA | `bg-blue-500` | `PiStar` |
| VERIFICADA | `bg-green-500` | `PiShieldCheck` |
| CONFIAVEL | `bg-amber-500` | `PiMedal` |

**NUNCA** criar cores inline para selos. Use `<SealBadge seal={seal} />`.

### Páginas Autenticadas (Dashboard)

O layout `DashboardLayout` já aplica padding e largura máxima. **NÃO** adicionar wrappers extras nas páginas:

```tsx
// ✅ CORRETO - retorna conteúdo direto
return (
  <>
    <Card>...</Card>
    <Card>...</Card>
  </>
);

// ❌ ERRADO - wrapper desnecessário
return (
  <div className="mx-auto max-w-6xl px-4 py-6">
    <Card>...</Card>
  </div>
);
```

### Badges de Verificação

Para exibir verificações/tags em listas, usar o padrão de pills:

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
  <PiCheckCircle className="size-4" />
  Texto aqui
</span>
```

### Grid de Disponibilidade

O componente de disponibilidade usa grid com 7 colunas (dias) + 1 coluna de labels:

```tsx
className="grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 sm:grid-cols-[60px_repeat(7,1fr)] sm:gap-1"
```

Células selecionadas: `border-fuchsia-500 bg-fuchsia-500 text-white`
Células não selecionadas: `border-gray-200 bg-gray-50 text-gray-300`

### Condicionais em JSX - Cuidado com Números

**NUNCA** usar `{count && ...}` quando `count` pode ser `0`. O React renderiza `0`.

```tsx
// ❌ ERRADO - renderiza "0" quando count é 0
{count && <span>{count} items</span>}

// ✅ CORRETO - usa comparação explícita
{(count ?? 0) > 0 && <span>{count} items</span>}
```

### Indicação de Campos Obrigatórios/Opcionais em Formulários

O padrão do projeto é:
- **Campos obrigatórios:** SEM indicador visual (é o padrão assumido)
- **Campos opcionais:** Usar a prop `optional={true}` no `FormLabel`, que adiciona "(opcional)" ao lado do label

**NUNCA** usar asterisco vermelho (`*`) para indicar campos obrigatórios.

```tsx
// ✅ CORRETO - campo obrigatório (sem indicador)
<FormLabel>Nome do curso</FormLabel>

// ✅ CORRETO - campo opcional (usa prop optional)
<FormLabel optional>Data de conclusão</FormLabel>

// ❌ ERRADO - nunca usar asterisco vermelho
<label>Nome do curso <span className="text-red-500">*</span></label>
```

---

## Uso de Props em Componentes

**SEMPRE** usar as props disponíveis nos componentes ao invés de sobrescrever com `className`.

### Regra Geral

Se um componente já tem uma prop para controlar algo (tamanho, variante, cor, etc.), **USE A PROP**. Nunca sobrescrever com `className` criando código frankenstein.

```tsx
// ✅ CORRETO - usa a prop size do componente
<DialogContent size="lg">

// ❌ ERRADO - gambiarra com className
<DialogContent className="sm:max-w-lg">

// ✅ CORRETO - usa a prop variant do componente
<Button variant="outline" size="sm">

// ❌ ERRADO - sobrescreve estilo com className
<Button className="border border-gray-300 bg-transparent text-sm">
```

### Antes de usar className

1. **Verifique as props** - Leia o componente para ver quais props estão disponíveis
2. **Use as props existentes** - Se existe uma prop para o que você precisa, use-a
3. **className é complemento** - Use `className` apenas para ajustes que NÃO estão cobertos pelas props

### Exemplos de Props Comuns

| Componente | Props Disponíveis |
|------------|-------------------|
| `DialogContent` | `size="sm" \| "lg" \| "xl" \| "2xl"` |
| `Button` | `variant`, `size` |
| `Badge` | `variant`, `size` |
| `Input` | `size` |
| `Card` | `variant` |

---

## Tailwind CSS 4

O projeto usa **Tailwind CSS 4.1.17**. Algumas classes mudaram de nome em relação ao Tailwind 3.

### Classes Renomeadas (SEMPRE usar a versão Tailwind 4)

| ❌ Tailwind 3 (não usar) | ✅ Tailwind 4 (usar) |
|--------------------------|----------------------|
| `break-words` | `wrap-break-word` |
| `flex-shrink-0` | `shrink-0` |
| `flex-shrink` | `shrink` |
| `flex-grow-0` | `grow-0` |
| `flex-grow` | `grow` |
| `overflow-ellipsis` | `text-overflow-ellipsis` |
| `overflow-clip` | `text-overflow-clip` |
| `decoration-slice` | `box-decoration-slice` |
| `decoration-clone` | `box-decoration-clone` |

### Exemplos

```tsx
// ✅ CORRETO - Tailwind 4
<p className="wrap-break-word whitespace-pre-wrap">Texto longo...</p>
<div className="shrink-0">Não encolhe</div>

// ❌ ERRADO - Tailwind 3 (causa warning na IDE)
<p className="break-words whitespace-pre-wrap">Texto longo...</p>
<div className="flex-shrink-0">Não encolhe</div>
```
