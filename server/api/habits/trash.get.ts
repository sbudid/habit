import { eq, and, isNotNull, gte } from 'drizzle-orm';
import { subDays } from 'date-fns';

export default eventHandler(async event => {
  const { user } = await requireUserSession(event);

  const sevenDaysAgo = subDays(new Date(), 7);

  const deletedHabits = await useDB()
    .select()
    .from(tables.habits)
    .where(
      and(
        eq(tables.habits.userId, user.id),
        isNotNull(tables.habits.deletedAt),
        gte(tables.habits.deletedAt, sevenDaysAgo)
      )
    )
    .orderBy(tables.habits.deletedAt)
    .all();

  return deletedHabits;
});
