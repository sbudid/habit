import { and, eq } from 'drizzle-orm';
import { useValidatedParams, z } from 'h3-zod';
import { queryHabitsWithSchedules } from '../../../utils/habit-schedule';

export default eventHandler(async event => {
  const { login } = await useValidatedParams(event, {
    login: z.string().toLowerCase(),
  });

  const user = await useDB().select().from(tables.users).where(eq(tables.users.login, login)).limit(1).get();

  if (!user || !user.userView) return [];

  return queryHabitsWithSchedules(and(eq(tables.habits.userId, user.id), eq(tables.habits.habitView, true)));
});
