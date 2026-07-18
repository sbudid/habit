import { eq } from 'drizzle-orm';
import { queryHabitsWithSchedules } from '../../utils/habit-schedule';

export default eventHandler(async event => {
  const { user } = await requireUserSession(event);
  return queryHabitsWithSchedules(eq(tables.habits.userId, user.id));
});
