import type { PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';

export type ReadRowsResult<T> = {
  data: T[];
  error: PostgrestError | null;
};

export type TableReadOptions = {
  columns?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
};

export async function readTableRows<T>(tableName: string, options: TableReadOptions = {}): Promise<ReadRowsResult<T>> {
  const supabase = getSupabaseClient();
  let query = supabase.from(tableName).select(options.columns ?? '*');

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }

  if (typeof options.limit === 'number') {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  return {
    data: (data ?? []) as T[],
    error,
  };
}