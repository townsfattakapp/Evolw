import * as pdfjsLib from 'pdfjs-dist';
import { ensureReadableStreamAsyncIterator } from './readable-stream-async-iterator';

if (typeof window !== 'undefined') {
  ensureReadableStreamAsyncIterator();
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

/** Extract plain text from a PDF ArrayBuffer (first `maxPages` pages). */
export async function extractPdfText(
  data: ArrayBuffer,
  maxPages = 5
): Promise<string> {
  ensureReadableStreamAsyncIterator();

  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const numPages = Math.min(pdf.numPages, maxPages);
  let text = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = (content.items || [])
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .filter(Boolean);
    text += strings.join(' ') + '\n';
  }

  return text.trim();
}
