import { eq } from 'drizzle-orm';

export default eventHandler(async event => {
  const { user } = await requireUserSession(event);

  await useDB().delete(tables.habits).where(eq(tables.habits.userId, user.id));
  await useDB().delete(tables.users).where(eq(tables.users.id, user.id));

  return { message: 'Akun dan semua kebiasaan terkait telah berhasil dihapus.' };
});
