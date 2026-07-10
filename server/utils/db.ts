import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

export { sql, eq, and, or, isNull, isNotNull, gte, count, inArray } from 'drizzle-orm';

export const tables = schema;

export function useDB() {
  // NuxtHub v0.9 hubDatabase() or direct D1 binding
  const db = (globalThis as any).__hubDatabase?.() || (globalThis as any).DB;
  if (!db) {
    throw new Error('Database not found. Make sure D1 binding is configured.');
  }
  return drizzle(db, { schema });
}

export type Habit = typeof tables.habits.$inferSelect;
export type User = typeof tables.users.$inferSelect;
