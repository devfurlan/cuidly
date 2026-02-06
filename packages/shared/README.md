# Shared Package

Utilitarios e funcoes compartilhadas entre os apps do monorepo.

## Slug Utilities

### Nanny Slug Format

O sistema usa slugs unicos para nannies no formato: `{primeiro-nome}-{4-chars-aleatorios}`

**Exemplos:**
- Maria Silva Santos → `maria-x7k2`
- Joao Pedro → `joao-9k3p`
- Lucas Furlan → `lucas-2ito`

### Funcoes Disponiveis

#### `generateNannySlug(name: string): string`

Gera um slug unico para uma nanny baseado no primeiro nome + 4 caracteres aleatorios.

```typescript
import { generateNannySlug } from '@cuidly/shared/utils/slug';

const slug = generateNannySlug('Maria Silva Santos');
// Resultado: "maria-x7k2"
```

#### `ensureUniqueSlug(name: string, checkExists: (slug: string) => Promise<boolean>): Promise<string>`

Garante que o slug gerado e unico, tentando ate 10 vezes.

```typescript
import { ensureUniqueSlug } from '@cuidly/shared/utils/slug';

const slug = await ensureUniqueSlug(
  'Maria Silva',
  async (slug) => {
    const exists = await prisma.nanny.findUnique({ where: { slug } });
    return !!exists;
  }
);
```

### Storage Structure

Todos os arquivos de nannies sao organizados por slug:

```
Bucket: files (publico)
├── nanny/{slug}/avatar.{ext}
└── nanny/{slug}/resume.{ext}

Bucket: documents (privado)
└── nanny/{slug}/{documentType}_{uuid}.{ext}
```

**Nota:** Sempre use `slug` para organizar arquivos no storage, nunca `nannyId`.
