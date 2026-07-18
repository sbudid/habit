import { asc, eq } from 'drizzle-orm';
import { useValidatedBody, z } from 'h3-zod';
import { buildReorderPlan } from '../../../app/utils/habitReorder.mjs';

export default eventHandler(async event => {
  const { user } = await requireUserSession(event);
  const { orderedIds } = await useValidatedBody(event, {
    orderedIds: z.array(z.number().int().positive()).max(500),
  });

  const ownedHabits = await useDB()
    .select({ id: tables.habits.id })
    .from(tables.habits)
    .where(eq(tables.habits.userId, user.id))
    .orderBy(asc(tables.habits.sortOrder), asc(tables.habits.id))
    .all();

  let plan: Array<{ id: number; sortOrder: number }>;
  try {
    plan = buildReorderPlan(
      ownedHabits.map(habit => habit.id),
      orderedIds,
    );
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Urutan habit tidak valid.' });
  }

  const database = hubDatabase();
  if (plan.length > 0) {
    await database.batch(plan.map(item => database.prepare('UPDATE habits SET sort_order = ? WHERE id = ? AND user_id = ?').bind(item.sortOrder, item.id, user.id)));
  }

  return { orderedIds };
});
