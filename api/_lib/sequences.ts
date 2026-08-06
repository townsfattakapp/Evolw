import { NeonQueryFunction } from '@neondatabase/serverless';

export async function getNextSequenceNumber(
  sql: NeonQueryFunction<false, false>,
  type: string,
  prefix: string,
  padding: number = 4
): Promise<string> {
  // Use a transaction or atomic update
  // Neon serverless handles single queries atomically
  
  const id = `${type}_${new Date().getFullYear()}`; // e.g. QUOTATION_2026
  
  const rows = await sql`
    INSERT INTO document_sequences (id, type, prefix, current_value, updated_at)
    VALUES (${id}, ${type}, ${prefix}, 1, NOW())
    ON CONFLICT (id) DO UPDATE SET
      current_value = document_sequences.current_value + 1,
      updated_at = NOW()
    RETURNING current_value
  `;

  const value = rows[0].current_value;
  return `${prefix}${String(value).padStart(padding, '0')}`;
}
