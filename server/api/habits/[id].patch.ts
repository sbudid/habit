import { and, eq } from 'drizzle-orm';
import { useValidatedBody, useValidatedParams, z, zh } from 'h3-zod';
import { normalizeHabitColor } from '../../../app/utils/habitUi.mjs';
import { getInvalidCompletionDays } from '../../../app/utils/habitSchedule.mjs';
import { queryHabitsWithSchedules, validatedScheduleValues } from '../../utils/habit-schedule';

export default eventHandler(async event => {
  const { id } = await useValidatedParams(event, { id: zh.intAsString });
  const body = await useValidatedBody(event, {
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).nullish(),
    completeDays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    habitView: z.boolean().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    scheduleType: z.enum(['daily', 'specific_days', 'times_per_week', 'interval_days']).optional(),
    scheduleDays: z.array(z.number().int().min(1).max(7)).max(7).optional(),
    weeklyTarget: z.number().int().min(1).max(7).optional(),
    intervalDays: z.number().int().min(2).max(365).optional(),
    scheduleStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  });
  const { user } = await requireUserSession(event);
  const ownerWhere = and(eq(tables.habits.id, id), eq(tables.habits.userId, user.id));
  const existing = (await queryHabitsWithSchedules(ownerWhere))[0];
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Habit tidak ditemukan.' });

  const scheduleProvided = ['scheduleType', 'scheduleDays', 'weeklyTarget', 'intervalDays', 'scheduleStartDate'].some(key => key in body);
  const schedule = scheduleProvided ? validatedScheduleValues(body) : null;

  if (body.completeDays !== undefined) {
    const invalidDays = getInvalidCompletionDays(existing, body.completeDays);
    if (invalidDays.length > 0) {
      throw createError({ statusCode: 400, statusMessage: `Tanggal completion tidak sesuai jadwal: ${invalidDays.join(', ')}` });
    }
  }

  const updatedFields: Partial<typeof tables.habits.$inferInsert> = {};
  if (body.title !== undefined) updatedFields.title = body.title;
  if (body.description !== undefined) updatedFields.description = body.description || null;
  if (body.completeDays !== undefined) updatedFields.completeDays = body.completeDays;
  if (body.habitView !== undefined) updatedFields.habitView = body.habitView;
  if (body.color !== undefined) updatedFields.color = normalizeHabitColor(body.color);

  const db = useDB();
  const statements: any[] = [];
  if (Object.keys(updatedFields).length > 0) statements.push(db.update(tables.habits).set(updatedFields).where(ownerWhere));
  if (schedule) {
    statements.push(
      db.insert(tables.habitSchedules).values({ habitId: id, ...schedule }).onConflictDoUpdate({ target: tables.habitSchedules.habitId, set: schedule }),
    );
  }

  if (statements.length === 1) await statements[0].run();
  else if (statements.length > 1) await db.batch(statements as [any, ...any[]]);

  return (await queryHabitsWithSchedules(ownerWhere))[0];
});
