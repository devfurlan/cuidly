/**
 * HTML Sanitization Utility
 *
 * Sanitiza HTML para prevenir XSS attacks quando usando dangerouslySetInnerHTML.
 * Usa uma abordagem de whitelist para permitir apenas tags e atributos seguros.
 */

// Tags HTML permitidas (whitelist)
const ALLOWED_TAGS = new Set([
  // Estrutura
  'div', 'span', 'p', 'br', 'hr',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Texto
  'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  // Listas
  'ul', 'ol', 'li',
  // Links e imagens
  'a', 'img',
  // Tabelas
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  // Citações e código
  'blockquote', 'q', 'cite', 'code', 'pre',
  // Figuras
  'figure', 'figcaption',
  // Semânticos
  'article', 'section', 'aside', 'header', 'footer', 'main', 'nav',
  // Outros
  'time', 'address', 'abbr', 'details', 'summary',
]);

// Atributos permitidos por tag
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'style', 'title', 'lang', 'dir']),
  'a': new Set(['href', 'target', 'rel', 'title']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  'time': new Set(['datetime']),
  'blockquote': new Set(['cite']),
  'q': new Set(['cite']),
  'abbr': new Set(['title']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
  'ol': new Set(['start', 'type', 'reversed']),
  'li': new Set(['value']),
};

// Protocolos permitidos para URLs
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Verifica se uma URL é segura
 */
function isSafeUrl(url: string): boolean {
  try {
    // Permitir URLs relativas
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('./')) {
      return true;
    }

    const parsedUrl = new URL(url);
    return ALLOWED_PROTOCOLS.has(parsedUrl.protocol);
  } catch {
    // Se não for uma URL válida, verificar se é relativa
    return !url.includes(':') || url.startsWith('data:image/');
  }
}

/**
 * Sanitiza um valor de atributo
 */
function sanitizeAttributeValue(attr: string, value: string): string {
  // Verificar URLs
  if (attr === 'href' || attr === 'src') {
    if (!isSafeUrl(value)) {
      return '#';
    }
    // Adicionar rel="noopener noreferrer" para links externos
    return value;
  }

  // Remover javascript: e event handlers de style
  if (attr === 'style') {
    // Remover url(), expression(), javascript:, etc.
    return value
      .replace(/url\s*\([^)]*\)/gi, '')
      .replace(/expression\s*\([^)]*\)/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/behavior\s*:/gi, '');
  }

  return value;
}

/**
 * Sanitiza HTML removendo tags e atributos perigosos
 *
 * @param html - String HTML para sanitizar
 * @returns HTML sanitizado
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remover scripts, iframes, objects, embeds, forms, inputs
  let sanitized = html
    // Remover scripts e seus conteúdos
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remover style tags inline maliciosas (manter classes CSS)
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remover iframes
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<iframe\b[^>]*\/?>/gi, '')
    // Remover objects
    .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
    .replace(/<object\b[^>]*\/?>/gi, '')
    // Remover embeds
    .replace(/<embed\b[^>]*\/?>/gi, '')
    // Remover forms
    .replace(/<form\b[^>]*>.*?<\/form>/gi, '')
    .replace(/<form\b[^>]*\/?>/gi, '')
    // Remover inputs
    .replace(/<input\b[^>]*\/?>/gi, '')
    .replace(/<textarea\b[^>]*>.*?<\/textarea>/gi, '')
    .replace(/<select\b[^>]*>.*?<\/select>/gi, '')
    .replace(/<button\b[^>]*>.*?<\/button>/gi, '')
    // Remover meta, link, base tags
    .replace(/<meta\b[^>]*\/?>/gi, '')
    .replace(/<link\b[^>]*\/?>/gi, '')
    .replace(/<base\b[^>]*\/?>/gi, '')
    // Remover SVG (pode conter scripts)
    .replace(/<svg\b[^>]*>.*?<\/svg>/gi, '')
    // Remover math (pode ter vulnerabilidades)
    .replace(/<math\b[^>]*>.*?<\/math>/gi, '');

  // Remover event handlers (on*)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Remover javascript: em qualquer atributo
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  // Remover data: URLs perigosas (exceto imagens)
  sanitized = sanitized.replace(/data:(?!image\/)[^"'\s>]*/gi, '');

  // Processar cada tag para validar atributos
  sanitized = sanitized.replace(
    /<(\/?)?(\w+)([^>]*)>/gi,
    (match, closing, tagName, attributes) => {
      const tag = tagName.toLowerCase();

      // Se a tag não está na whitelist, remover
      if (!ALLOWED_TAGS.has(tag)) {
        return '';
      }

      // Se é uma tag de fechamento, retornar sem atributos
      if (closing) {
        return `</${tag}>`;
      }

      // Processar atributos
      const allowedTagAttrs = ALLOWED_ATTRIBUTES[tag] || new Set();
      const globalAttrs = ALLOWED_ATTRIBUTES['*'];

      const sanitizedAttrs: string[] = [];

      // Extrair e validar cada atributo
      const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/g;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';

        // Verificar se o atributo é permitido
        if (
          allowedTagAttrs.has(attrName) ||
          globalAttrs.has(attrName)
        ) {
          // Ignorar event handlers
          if (attrName.startsWith('on')) {
            continue;
          }

          const sanitizedValue = sanitizeAttributeValue(attrName, attrValue);
          sanitizedAttrs.push(`${attrName}="${sanitizedValue.replace(/"/g, '&quot;')}"`);
        }
      }

      // Para links externos, adicionar segurança
      if (tag === 'a') {
        const hasTarget = sanitizedAttrs.some(attr => attr.startsWith('target='));
        const hasRel = sanitizedAttrs.some(attr => attr.startsWith('rel='));

        if (hasTarget && !hasRel) {
          sanitizedAttrs.push('rel="noopener noreferrer"');
        }
      }

      // Reconstruir a tag
      const attrsStr = sanitizedAttrs.length > 0 ? ' ' + sanitizedAttrs.join(' ') : '';

      // Tags self-closing
      const selfClosing = ['img', 'br', 'hr', 'meta', 'link', 'input'].includes(tag);
      return selfClosing ? `<${tag}${attrsStr} />` : `<${tag}${attrsStr}>`;
    }
  );

  return sanitized;
}

/**
 * Sanitiza HTML e retorna apenas texto (remove todas as tags)
 */
export function sanitizeToText(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export default sanitizeHtml;
