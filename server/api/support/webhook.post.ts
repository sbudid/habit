export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Pakasir webhook payload
  const { project, order_id, amount, payment_method, status } = body;
  
  if (status !== 'success') {
    return { received: true, skipped: true };
  }

  // Extract user_id from order_id: RUTINA-{userId}-{timestamp}
  const match = order_id?.match(/^RUTINA-(\d+)-/);
  if (!match) {
    return { received: true, error: 'Invalid order_id format' };
  }
  
  const userId = parseInt(match[1]);
  
  // Check if already recorded
  const existing = await useDB()
    .select()
    .from(tables.supporters)
    .where(eq(tables.supporters.userId, userId))
    .get();
  
  if (existing) {
    return { received: true, alreadyProcessed: true };
  }

  // Record supporter
  await useDB().insert(tables.supporters).values({
    userId,
    orderId: order_id,
    amount: parseInt(amount),
    paymentMethod: payment_method || 'qris',
    paidAt: new Date(),
  });

  return { received: true, success: true };
});
