import { asc, eq, type SQL } from 'drizzle-orm';
import { createError } from 'h3';
import { isValidDateKey } from '../../app/utils/habitSchedule.mjs';
import { tables, useDB } from './db';

export type HabitScheduleType = 'daily' | 'specific_days' | 'times_per_week' | 'interval_days';

export interface HabitScheduleInput {
  scheduleType?: HabitScheduleType;
  scheduleDays?: number[];
  weeklyTarget?: number;
  intervalDays?: number;
  scheduleStartDate?: string | null;
}

export function validatedScheduleValues(input: HabitScheduleInput) {
  const scheduleType = input.scheduleType ?? 'daily';
  const scheduleDays = [...new Set(input.scheduleDays ?? [])].sort((left, right) => left - right);
  const weeklyTarget = input.weeklyTarget ?? 1;
  const intervalDays = input.intervalDays ?? 2;
  const scheduleStartDate = input.scheduleStartDate ?? null;

  if (scheduleType === 'specific_days' && scheduleDays.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Pilih minimal satu hari.' });
  }
  if (scheduleDays.some(day => !Number.isInteger(day) || day < 1 || day > 7)) {
    throw createError({ statusCode: 400, statusMessage: 'Hari jadwal tidak valid.' });
  }
  if (!Number.isInteger(weeklyTarget) || weeklyTarget < 1 || weeklyTarget > 7) {
    throw createError({ statusCode: 400, statusMessage: 'Target mingguan harus 1–7.' });
  }
  if (!Number.isInteger(intervalDays) || intervalDays < 2 || intervalDays > 365) {
    throw createError({ statusCode: 400, statusMessage: 'Interval harus 2–365 hari.' });
  }
  if (scheduleStartDate !== null && !isValidDateKey(scheduleStartDate)) {
    throw createError({ statusCode: 400, statusMessage: 'Tanggal mulai tidak valid.' });
  }
  if (scheduleType === 'interval_days' && scheduleStartDate === null) {
    throw createError({ statusCode: 400, statusMessage: 'Tanggal mulai wajib untuk jadwal interval.' });
  }

  return { scheduleType, scheduleDays, weeklyTarget, intervalDays, scheduleStartDate };
}

export async function queryHabitsWithSchedules(where?: SQL) {
  const rows = await useDB()
    .select({
      id: tables.habits.id,
      userId: tables.habits.userId,
      title: tables.habits.title,
      description: tables.habits.description,
      color: tables.habits.color,
      completeDays: tables.habits.completeDays,
      createdAt: tables.habits.createdAt,
      habitView: tables.habits.habitView,
      sortOrder: tables.habits.sortOrder,
      scheduleType: tables.habitSchedules.scheduleType,
      scheduleDays: tables.habitSchedules.scheduleDays,
      weeklyTarget: tables.habitSchedules.weeklyTarget,
      intervalDays: tables.habitSchedules.intervalDays,
      scheduleStartDate: tables.habitSchedules.scheduleStartDate,
    })
    .from(tables.habits)
    .leftJoin(tables.habitSchedules, eq(tables.habitSchedules.habitId, tables.habits.id))
    .where(where)
    .orderBy(asc(tables.habits.sortOrder), asc(tables.habits.id))
    .all();

  return rows.map(row => ({
    ...row,
    scheduleType: row.scheduleType ?? ('daily' as const),
    scheduleDays: row.scheduleDays ?? [],
    weeklyTarget: row.weeklyTarget ?? 1,
    intervalDays: row.intervalDays ?? 2,
    scheduleStartDate: row.scheduleStartDate ?? null,
  }));
}
