import { eq, and, isNotNull, gte } from 'drizzle-orm';
import { useValidatedParams, zh } from 'h3-zod';
import { subDays } from 'date-fns';

export default eventHandler(async event => {
  const { id } = await useValidatedParams(event, {
    id: zh.intAsString,
  });

  const { user } = await requireUserSession(event);

  const sevenDaysAgo = subDays(new Date(), 7);

  // Restore hanya jika masih dalam 7 hari
  const restored = await useDB()
    .update(tables.habits)
    .set({ deletedAt: null })
    .where(
      and(
        eq(tables.habits.id, id),
        eq(tables.habits.userId, user.id),
        isNotNull(tables.habits.deletedAt),
        gte(tables.habits.deletedAt, sevenDaysAgo)
      )
    )
    .returning()
    .get();

  if (!restored) {
    throw createError({ statusCode: 404, message: 'Kebiasaan tidak ditemukan atau sudah kedaluwarsa' });
  }

  return restored;
});
