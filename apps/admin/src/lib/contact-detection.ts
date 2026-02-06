/**
 * Contact Information Detection Library
 *
 * Detects phone numbers, emails, and other contact info in text,
 * including obfuscated/disguised forms to prevent users from bypassing filters
 */


/**
 * Normalize text by replacing common obfuscations
 */
function normalizeObfuscatedText(text: string): string {
  let normalized = text.toLowerCase();

  // Replace word numbers (zero, um, dois, etc.)
  const wordNumbers: Record<string, string> = {
    'zero': '0', 'um': '1', 'dois': '2', 'tres': '3', 'três': '3',
    'quatro': '4', 'cinco': '5', 'seis': '6', 'sete': '7',
    'oito': '8', 'nove': '9',
  };

  for (const [word, digit] of Object.entries(wordNumbers)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    normalized = normalized.replace(regex, digit);
  }

  // Replace emoji numbers
  const emojiNumbers: Record<string, string> = {
    '0️⃣': '0', '1️⃣': '1', '2️⃣': '2', '3️⃣': '3', '4️⃣': '4',
    '5️⃣': '5', '6️⃣': '6', '7️⃣': '7', '8️⃣': '8', '9️⃣': '9',
    '⓪': '0', '①': '1', '②': '2', '③': '3', '④': '4',
    '⑤': '5', '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9',
  };

  for (const [emoji, digit] of Object.entries(emojiNumbers)) {
    normalized = normalized.replace(new RegExp(emoji, 'g'), digit);
  }

  // Replace @ obfuscations
  normalized = normalized
    .replace(/\barroba\b/gi, '@')
    .replace(/\bat\b/gi, '@')
    .replace(/\(at\)/gi, '@')
    .replace(/\[at\]/gi, '@')
    .replace(/\{at\}/gi, '@');

  // Replace dot obfuscations
  normalized = normalized
    .replace(/\bponto\b/gi, '.')
    .replace(/\bdot\b/gi, '.')
    .replace(/\bpont\b/gi, '.');

  return normalized;
}

/**
 * Extract sequences that look like phone numbers (with or without separators)
 */
function extractPhonePatterns(text: string): string[] {
  const normalized = normalizeObfuscatedText(text);
  const patterns: string[] = [];

  // Remove all non-digit and non-space characters temporarily
  const cleaned = normalized.replace(/[^\d\s]/g, ' ');

  // Look for sequences of digits (possibly separated by spaces)
  // Brazilian phone: 11 digits (with area code)
  const phoneRegexes = [
    // Standard format: (11) 91234-5678 or 11 91234-5678
    /\b\d{2}[\s\-]?\d{4,5}[\s\-]?\d{4}\b/g,
    // Separated digits: 1 1 9 1 2 3 4 5 6 7 8
    /\b(?:\d[\s\-_.*|+~#]*){10,11}\b/g,
    // Any sequence of 10-11 digits with various separators
    /\b(?:\d+[\s\-_.*|+~#]+){2,}\d+\b/g,
  ];

  for (const regex of phoneRegexes) {
    const matches = cleaned.match(regex);
    if (matches) {
      patterns.push(...matches.map(m => m.replace(/\D/g, '')));
    }
  }

  return patterns.filter(p => p.length >= 10 && p.length <= 11);
}

/**
 * Extract sequences that look like emails
 */
function extractEmailPatterns(text: string): string[] {
  const normalized = normalizeObfuscatedText(text);
  const patterns: string[] = [];

  // Standard email pattern
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  const emails = normalized.match(emailRegex);
  if (emails) {
    patterns.push(...emails);
  }

  // Check for obfuscated emails (e.g., "joao arroba gmail ponto com")
  // Look for pattern: word + @ + word + . + word
  const obfuscatedEmailRegex = /\b[a-zA-Z0-9]+[\s\-_]*@[\s\-_]*[a-zA-Z0-9]+[\s\-_.]*(?:com|br|net|org|edu|gov)\b/gi;
  const obfuscatedEmails = normalized.match(obfuscatedEmailRegex);
  if (obfuscatedEmails) {
    patterns.push(...obfuscatedEmails);
  }

  return patterns;
}

/**
 * Extract social media handles
 */
function extractSocialMediaHandles(text: string): string[] {
  const patterns: string[] = [];

  // Instagram, Twitter, TikTok handles
  const handleRegex = /@[\w.]+/g;
  const handles = text.match(handleRegex);
  if (handles) {
    patterns.push(...handles);
  }

  // Common social media patterns
  const socialPatterns = [
    /\b(?:instagram|insta|ig)[\s:]+@?[\w.]+/gi,
    /\b(?:whatsapp|whats|wpp|zap)[\s:]+\d+/gi,
    /\b(?:telegram|tg)[\s:]+@?[\w.]+/gi,
    /\b(?:facebook|fb)[\s:]+[\w.]+/gi,
  ];

  for (const regex of socialPatterns) {
    const matches = text.match(regex);
    if (matches) {
      patterns.push(...matches);
    }
  }

  return patterns;
}

/**
 * Check for URL patterns
 */
function extractURLPatterns(text: string): string[] {
  const patterns: string[] = [];

  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi;
  const urls = text.match(urlRegex);
  if (urls) {
    patterns.push(...urls);
  }

  return patterns;
}

/**
 * Check for WhatsApp invitation links
 */
function extractWhatsAppLinks(text: string): string[] {
  const patterns: string[] = [];

  const whatsappRegex = /(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/\d+/gi;
  const links = text.match(whatsappRegex);
  if (links) {
    patterns.push(...links);
  }

  return patterns;
}

/**
 * Main detection function - returns all found contact information
 */
export interface ContactDetectionResult {
  hasContact: boolean;
  phones: string[];
  emails: string[];
  socialMedia: string[];
  urls: string[];
  whatsappLinks: string[];
  warnings: string[];
}

export function detectContactInformation(text: string): ContactDetectionResult {
  const phones = extractPhonePatterns(text);
  const emails = extractEmailPatterns(text);
  const socialMedia = extractSocialMediaHandles(text);
  const urls = extractURLPatterns(text);
  const whatsappLinks = extractWhatsAppLinks(text);

  const warnings: string[] = [];

  if (phones.length > 0) {
    warnings.push(`Telefone detectado: ${phones.length} ocorrência(s)`);
  }

  if (emails.length > 0) {
    warnings.push(`E-mail detectado: ${emails.length} ocorrência(s)`);
  }

  if (socialMedia.length > 0) {
    warnings.push(`Rede social detectada: ${socialMedia.length} ocorrência(s)`);
  }

  if (urls.length > 0) {
    warnings.push(`URL detectada: ${urls.length} ocorrência(s)`);
  }

  if (whatsappLinks.length > 0) {
    warnings.push(`Link de WhatsApp detectado: ${whatsappLinks.length} ocorrência(s)`);
  }

  const hasContact =
    phones.length > 0 ||
    emails.length > 0 ||
    socialMedia.length > 0 ||
    urls.length > 0 ||
    whatsappLinks.length > 0;

  return {
    hasContact,
    phones: [...new Set(phones)],
    emails: [...new Set(emails)],
    socialMedia: [...new Set(socialMedia)],
    urls: [...new Set(urls)],
    whatsappLinks: [...new Set(whatsappLinks)],
    warnings,
  };
}

/**
 * Validate if text is safe (no contact info)
 */
export function isSafeText(text: string): {
  safe: boolean;
  reason?: string;
} {
  const result = detectContactInformation(text);

  if (result.hasContact) {
    return {
      safe: false,
      reason: result.warnings.join(', '),
    };
  }

  return { safe: true };
}
