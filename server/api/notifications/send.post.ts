import { z } from 'zod/v4-mini';

const bodySchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  sendAt: z.string().optional(), // ISO 8601, e.g. "2026-07-23T08:00:00+07:00"
  externalUserId: z.string().optional(), // OneSignal external user ID
});

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = bodySchema.parse(await readBody(event));

  const config = useRuntimeConfig();
  const appId = config.onesignalAppId as string;
  const restKey = config.onesignalRestApiKey as string;

  if (!appId || !restKey) {
    throw createError({ statusCode: 500, message: 'OneSignal not configured' });
  }

  // Build filters: target this specific user by external_id
  const filters = body.externalUserId
    ? [{ field: 'external_user_id', relation: '=', value: body.externalUserId }]
    : [{ field: 'external_user_id', relation: '=', value: String(user.id) }];

  const payload: Record<string, any> = {
    app_id: appId,
    headings: { en: body.title },
    contents: { en: body.message },
    filters,
  };

  if (body.sendAt) {
    payload.send_after = body.sendAt;
  }

  const resp = await $fetch<{ id?: string; errors?: any }>('https://api.onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${restKey}`,
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  if (resp.errors) {
    throw createError({ statusCode: 502, message: `OneSignal: ${JSON.stringify(resp.errors)}` });
  }

  return { ok: true, notificationId: resp.id };
});
