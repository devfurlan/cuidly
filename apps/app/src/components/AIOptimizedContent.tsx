/**
 * Componente otimizado para AI search engines
 * Fornece contexto semântico adicional para melhor indexação e citação
 */

import { sanitizeHtml } from '@/lib/sanitize-html';

interface AIOptimizedContentProps {
  content: string;
  title: string;
  category?: string;
  excerpt?: string;
}

export function AIOptimizedContent({
  content,
  title,
  category,
  excerpt,
}: AIOptimizedContentProps) {
  // Sanitizar conteúdo HTML para prevenir XSS
  const sanitizedContent = sanitizeHtml(content);

  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      className="post-content"
    >
      {/* Hidden metadata for AI parsing */}
      <meta itemProp="headline" content={title} />
      {category && <meta itemProp="articleSection" content={category} />}
      {excerpt && <meta itemProp="description" content={excerpt} />}
      <meta itemProp="inLanguage" content="pt-BR" />

      {/* Main content with semantic HTML - sanitizado para segurança */}
      <div
        itemProp="articleBody"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </article>
  );
}

/**
 * Componente para adicionar sinais de confiabilidade para AI
 */
export function TrustworthinessSignals({
  publishDate,
  modifiedDate,
  author,
}: {
  publishDate: string;
  modifiedDate: string;
  author: string;
}) {
  return (
    <div className="hidden" aria-hidden="true">
      {/* Sinais invisíveis mas parseáveis por AI */}
      <div itemProp="datePublished" content={publishDate}>
        Publicado em: {new Date(publishDate).toLocaleDateString('pt-BR')}
      </div>
      <div itemProp="dateModified" content={modifiedDate}>
        Atualizado em: {new Date(modifiedDate).toLocaleDateString('pt-BR')}
      </div>
      <div itemProp="author" itemScope itemType="https://schema.org/Person">
        <span itemProp="name">{author}</span>
      </div>
      <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
        <span itemProp="name">Cuidly</span>
        <meta itemProp="url" content="https://cuidly.com" />
      </div>
    </div>
  );
}

/**
 * Componente para resumo AI-friendly no topo do artigo
 */
export function ArticleSummary({ excerpt }: { excerpt: string }) {
  const cleanExcerpt = excerpt.replace(/<[^>]+>/g, '').trim();

  if (!cleanExcerpt) return null;

  return (
    <div
      className="border-l-4 border-primary-500 bg-primary-50 p-4 mb-8 rounded-r-lg"
      role="note"
      aria-label="Resumo do artigo"
    >
      <p className="text-sm font-semibold text-primary-900 mb-2">
        📝 Resumo do Artigo
      </p>
      <p className="text-sm text-primary-800 leading-relaxed" itemProp="abstract">
        {cleanExcerpt}
      </p>
    </div>
  );
}

/**
 * Componente para key takeaways (pontos principais)
 * Muito útil para AI summarization
 */
export function KeyTakeaways({ points }: { points: string[] }) {
  if (!points.length) return null;

  return (
    <aside
      className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8"
      aria-label="Pontos principais"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        💡 Pontos Principais
      </h3>
      <ul className="space-y-2" itemProp="mentions" itemScope itemType="https://schema.org/ItemList">
        {points.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-gray-700"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <span className="text-primary-600 font-bold mt-0.5">•</span>
            <span itemProp="name">{point}</span>
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
