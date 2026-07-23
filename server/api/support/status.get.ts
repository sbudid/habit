export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  
  const supporter = await useDB()
    .select()
    .from(tables.supporters)
    .where(eq(tables.supporters.userId, user.id))
    .get();
  
  return {
    isSupporter: !!supporter,
    paidAt: supporter?.paidAt || null,
    amount: supporter?.amount || null,
  };
});
