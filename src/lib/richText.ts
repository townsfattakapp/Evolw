import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'a',
  'span',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Normalize plain text / pasted ChatGPT HTML into sanitized HTML for storage & display. */
export function sanitizeRichText(value: string): string {
  if (!value?.trim()) return '';

  const source = looksLikeHtml(value)
    ? value
    : value
        .split(/\n{2,}/)
        .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
        .join('');

  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  }).trim();
}

/** Plain-text excerpt for SEO / truncated previews. */
export function richTextToPlain(value: string): string {
  if (!value) return '';
  if (!looksLikeHtml(value)) return value.trim();
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
