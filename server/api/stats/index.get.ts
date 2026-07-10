import { count, eq, isNull } from 'drizzle-orm';

export default eventHandler(async () => {
  const userCount = await useDB()
    .select({ count: count() })
    .from(tables.users)
    .get();

  const habitCount = await useDB()
    .select({ count: count() })
    .from(tables.habits)
    .where(isNull(tables.habits.deletedAt))
    .get();

  return {
    users: userCount?.count ?? 0,
    habits: habitCount?.count ?? 0,
  };
});
