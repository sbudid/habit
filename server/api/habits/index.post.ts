import { and, eq, sql } from 'drizzle-orm';
import { useValidatedBody, z } from 'h3-zod';
import { DEFAULT_HABIT_COLOR, normalizeHabitColor } from '../../../app/utils/habitUi.mjs';
import { validatedScheduleValues } from '../../utils/habit-schedule';

export default eventHandler(async event => {
  const { user } = await requireUserSession(event);
  const body = await useValidatedBody(event, {
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).nullish(),
    color: z.string().optional().default(DEFAULT_HABIT_COLOR),
    habitView: z.boolean().optional().default(true),
    scheduleType: z.enum(['daily', 'specific_days', 'times_per_week', 'interval_days']).optional(),
    scheduleDays: z.array(z.number().int().min(1).max(7)).max(7).optional(),
    weeklyTarget: z.number().int().min(1).max(7).optional(),
    intervalDays: z.number().int().min(2).max(365).optional(),
    scheduleStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  });
  const schedule = validatedScheduleValues(body);
  const db = useDB();
  const maxOrder = await db
    .select({ value: sql<number>`coalesce(max(${tables.habits.sortOrder}), -1)` })
    .from(tables.habits)
    .where(eq(tables.habits.userId, user.id))
    .get();

  const habit = await db
    .insert(tables.habits)
    .values({
      userId: user.id,
      title: body.title,
      description: body.description || null,
      color: normalizeHabitColor(body.color),
      completeDays: [],
      createdAt: new Date(),
      habitView: body.habitView,
      sortOrder: Number(maxOrder?.value ?? -1) + 1,
    })
    .returning()
    .get();

  try {
    await db.insert(tables.habitSchedules).values({ habitId: habit.id, ...schedule }).run();
  } catch (error) {
    await db.delete(tables.habits).where(and(eq(tables.habits.id, habit.id), eq(tables.habits.userId, user.id))).run();
    throw error;
  }

  return { ...habit, ...schedule };
});
