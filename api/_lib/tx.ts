import type { NeonQueryFunction } from '@neondatabase/serverless';

type Sql = NeonQueryFunction<false, false>;
type TxSql = NeonQueryFunction<false, false>;

/**
 * Run work inside a Neon HTTP transaction when available,
 * otherwise fall back to sequential queries (still better than broken sql.begin).
 */
export async function withTransaction<T>(
  sql: Sql,
  fn: (tx: TxSql) => Promise<T>
): Promise<T> {
  const anySql = sql as Sql & {
    transaction?: (cb: (tx: TxSql) => Promise<T>) => Promise<T>;
  };

  if (typeof anySql.transaction === 'function') {
    return anySql.transaction(fn);
  }

  return fn(sql);
}
