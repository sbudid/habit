import { useValidatedBody, z } from 'h3-zod';

const CATEGORIES = ['umum', 'kesehatan', 'produktivitas', 'belajar', 'keuangan', 'sosial', 'kreativitas'];

export default eventHandler(async event => {
  const { title, description, habitView, category, targetDays } = await useValidatedBody(event, {
    title: z.string().min(1, 'Judul wajib diisi').trim(),
    description: z.string().min(1, 'Deskripsi wajib diisi').trim(),
    habitView: z.boolean(),
    category: z.string().optional().default('umum'),
    targetDays: z.number().min(1).max(365).optional().default(40),
  });

  const { user } = await requireUserSession(event);

  // Hitung sort_order berikutnya
  const maxOrder = await useDB()
    .select({ max: tables.habits.sortOrder })
    .from(tables.habits)
    .where(eq(tables.habits.userId, user.id))
    .orderBy(tables.habits.sortOrder)
    .limit(1)
    .get();

  const nextOrder = (maxOrder?.max ?? -1) + 1;

  const habit = await useDB()
    .insert(tables.habits)
    .values({
      userId: user.id,
      title,
      description,
      category: CATEGORIES.includes(category) ? category : 'umum',
      targetDays,
      sortOrder: nextOrder,
      createdAt: new Date(),
      habitView,
    })
    .returning()
    .get();

  return habit;
});
