import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

export { sql, eq, and, or, asc } from 'drizzle-orm';

export const tables = schema;

export function useDB() {
  return drizzle(hubDatabase(), { schema });
}

export type Habit = typeof tables.habits.$inferSelect & {
  scheduleType: 'daily' | 'specific_days' | 'times_per_week' | 'interval_days';
  scheduleDays: number[];
  weeklyTarget: number;
  intervalDays: number;
  scheduleStartDate: string | null;
};
export type DatabaseUser = typeof tables.users.$inferSelect;
