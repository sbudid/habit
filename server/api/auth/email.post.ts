import { useValidatedBody, z } from 'h3-zod';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashStringToPositiveInt(input: string) {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }

  return Math.abs(hash) || 1;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function buildLogin(name: string, email: string) {
  const base = slugify(name) || slugify(email.split('@')[0] || '') || 'rutina-user';
  const suffix = hashStringToPositiveInt(email).toString(36).slice(0, 5);

  return `${base}-${suffix}`;
}

export default eventHandler(async event => {
  const { name, email } = await useValidatedBody(event, {
    name: z.string().min(2, 'Nama minimal 2 karakter').trim(),
    email: z.string().email('Email belum valid').trim(),
  });

  const normalizedEmail = normalizeEmail(email);
  const userId = hashStringToPositiveInt(normalizedEmail);
  const login = buildLogin(name, normalizedEmail);
  const now = new Date();

  const dbUser = await useDB()
    .insert(tables.users)
    .values({
      id: userId,
      login,
      name,
      bio: 'Sedang bangun rutinitas kecil yang konsisten.',
      avatarUrl: '/avatar-rutina.svg',
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: tables.users.id,
      set: {
        login,
        name,
        avatarUrl: '/avatar-rutina.svg',
      },
    })
    .returning()
    .get();

  await setUserSession(event, {
    user: {
      id: dbUser.id,
      login: dbUser.login,
      name: dbUser.name || dbUser.login,
      email: normalizedEmail,
      bio: dbUser.bio || '',
      avatar_url: dbUser.avatarUrl,
      html_url: '',
      type: 'rutina-email',
    } as any,
  });

  return {
    ok: true,
    user: dbUser,
    redirectTo: `/${dbUser.login}`,
  };
});
