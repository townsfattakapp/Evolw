import { sanitizeRichText } from '../../lib/richText';
import { cn } from '../../lib/utils';

type RichTextProps = {
  html: string;
  className?: string;
  as?: 'div' | 'article' | 'section';
};

/**
 * Renders sanitized job/content HTML with typography styles.
 * Supports bold, italics, lists, headings — as pasted from ChatGPT.
 */
export function RichText({ html, className, as: Tag = 'div' }: RichTextProps) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;

  return (
    <Tag
      className={cn('evolw-rich-text', className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
