export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  
  const config = useRuntimeConfig();
  const slug = config.pakasirSlug;
  const apiKey = config.pakasirApiKey;
  
  if (!slug || !apiKey) {
    throw createError({ statusCode: 500, message: 'Pakasir belum dikonfigurasi' });
  }

  const orderId = `RUTINA-${user.id}-${Date.now()}`;
  const amount = 25000;
  const redirect = `${getRequestURL(event).origin}/support/success`;

  // Redirect ke Pakasir payment page
  const payUrl = `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent(redirect)}`;
  
  await sendRedirect(event, payUrl);
});
