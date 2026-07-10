import { eq } from 'drizzle-orm';
import { useValidatedBody, z } from 'h3-zod';

export default eventHandler(async event => {
  const { userView, lang } = await useValidatedBody(event, {
    userView: z.boolean().optional(),
    lang: z.enum(['id', 'en']).optional(),
  });

  const { user } = await requireUserSession(event);

  const updatedFields: Record<string, unknown> = {};
  if (userView !== undefined) updatedFields.userView = userView;
  if (lang) updatedFields.lang = lang;

  const updatedUser = await useDB().update(tables.users).set(updatedFields).where(eq(tables.users.id, user.id)).returning().get();

  return updatedUser;
});
