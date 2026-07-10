import { useValidatedBody, z } from 'h3-zod';
import { eq, and, isNull, inArray } from 'drizzle-orm';

export default eventHandler(async event => {
  const { order } = await useValidatedBody(event, {
    order: z.array(z.object({ id: z.number(), sortOrder: z.number() })),
  });

  const { user } = await requireUserSession(event);

  // Update semua sort order dalam satu transaksi
  for (const item of order) {
    await useDB()
      .update(tables.habits)
      .set({ sortOrder: item.sortOrder })
      .where(and(eq(tables.habits.id, item.id), eq(tables.habits.userId, user.id), isNull(tables.habits.deletedAt)))
      .run();
  }

  return { success: true };
});
