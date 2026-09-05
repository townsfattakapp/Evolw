/**
 * Safari (stable) still lacks ReadableStream async iteration, which pdf.js
 * uses inside getTextContent via `for await (... of stream)`. Without this,
 * Safari throws: TypeError: undefined is not a function (near '...a of s...').
 * @see https://github.com/mozilla/pdf.js/issues/21557
 */
export function ensureReadableStreamAsyncIterator(): void {
  if (typeof ReadableStream === 'undefined') return;

  const proto = ReadableStream.prototype as unknown as {
    [Symbol.asyncIterator]?: () => AsyncIterableIterator<unknown>;
  };

  if (typeof proto[Symbol.asyncIterator] === 'function') return;

  proto[Symbol.asyncIterator] = async function* (this: ReadableStream<unknown>) {
    const reader = this.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  };
}
