This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 📦 Projeto Cuidly — Backend

Este projeto utiliza **Prisma ORM** com **PostgreSQL (Supabase)** e aplica políticas de segurança com **Row Level Security (RLS)**.

---

## 🚀 Como iniciar o projeto localmente

1. Instale as dependências:

```bash
npm install
```

2. Configure o `.env` com a string de conexão do Supabase/PostgreSQL:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
```

3. Gere o client do Prisma:

```bash
npx prisma generate
```

4. Rode as migrations:

```bash
npx prisma migrate dev
```

---

## ⚠️ Passos manuais obrigatórios no Supabase

Algumas configurações específicas do Supabase **não podem ser aplicadas via Prisma** e precisam ser feitas manualmente após rodar as migrations.

---

### ✅ 1. Habilitar Row Level Security (RLS) em todas as tabelas

```sql
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('_prisma_migrations')
  )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END $$;
```

---

### ✅ 2. Definir default `auth.uid()` no campo `id` da tabela `users`

```sql
ALTER TABLE public.users
ALTER COLUMN id SET DEFAULT auth.uid();
```

---

### ✅ 3. Criar políticas de acesso (RLS) para leitura e inserção da tabela `users`

```sql
CREATE POLICY "Enable insert for authenticated users only"
  ON public.users
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    true
  );
CREATE POLICY "Enable read access for all users"
  ON public.users
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (
    true
  );
```

---

ℹ️ Essas instruções são necessárias apenas uma vez por ambiente (ex: staging, produção) e devem ser executadas no SQL Editor do Supabase.
