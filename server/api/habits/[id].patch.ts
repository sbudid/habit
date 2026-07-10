import { eq, and, isNull } from 'drizzle-orm';
import { useValidatedParams, useValidatedBody, z, zh } from 'h3-zod';

const CATEGORIES = ['umum', 'kesehatan', 'produktivitas', 'belajar', 'keuangan', 'sosial', 'kreativitas'];

export default eventHandler(async event => {
  const { id } = await useValidatedParams(event, {
    id: zh.intAsString,
  });

  const { title, description, completeDays, habitView, category, targetDays, sortOrder } = await useValidatedBody(event, {
    title: z.string().optional(),
    description: z.string().optional(),
    completeDays: z.array(z.string()).optional(),
    habitView: z.boolean().optional(),
    category: z.string().optional(),
    targetDays: z.number().min(1).max(365).optional(),
    sortOrder: z.number().optional(),
  });

  const { user } = await requireUserSession(event);

  const updatedFields: Record<string, unknown> = {};
  if (title) updatedFields.title = title;
  if (description) updatedFields.description = description;
  if (completeDays) updatedFields.completeDays = completeDays;
  if (habitView !== undefined) updatedFields.habitView = habitView;
  if (category && CATEGORIES.includes(category)) updatedFields.category = category;
  if (targetDays !== undefined) updatedFields.targetDays = targetDays;
  if (sortOrder !== undefined) updatedFields.sortOrder = sortOrder;

  const habit = await useDB()
    .update(tables.habits)
    .set(updatedFields)
    .where(and(eq(tables.habits.id, id), eq(tables.habits.userId, user.id), isNull(tables.habits.deletedAt)))
    .returning()
    .get();

  return habit;
});
