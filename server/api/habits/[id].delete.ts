import { eq, and, isNull } from 'drizzle-orm';
import { useValidatedParams, zh } from 'h3-zod';

export default eventHandler(async event => {
  const { id } = await useValidatedParams(event, {
    id: zh.intAsString,
  });

  const { user } = await requireUserSession(event);

  // Soft delete: set deletedAt
  const deletedHabit = await useDB()
    .update(tables.habits)
    .set({ deletedAt: new Date() })
    .where(and(eq(tables.habits.id, id), eq(tables.habits.userId, user.id), isNull(tables.habits.deletedAt)))
    .returning()
    .get();

  return deletedHabit;
});
