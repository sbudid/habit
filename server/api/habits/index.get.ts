import { eq, and, isNull } from 'drizzle-orm';

export default eventHandler(async event => {
  const { user } = await requireUserSession(event);

  const habits = await useDB()
    .select()
    .from(tables.habits)
    .where(and(eq(tables.habits.userId, user.id), isNull(tables.habits.deletedAt)))
    .orderBy(tables.habits.sortOrder)
    .all();

  return habits as Habit[];
});
