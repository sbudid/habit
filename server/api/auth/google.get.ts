export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    const login = user.email.toLowerCase();
    const numericId = parseInt(user.sub.slice(-9), 10);

    await useDB()
      .insert(tables.users)
      .values({
        id: numericId,
        login: login,
        name: user.name || user.email,
        bio: '',
        avatarUrl: user.picture || '',
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: tables.users.id,
        set: {
          name: user.name || user.email,
          avatarUrl: user.picture || '',
        },
      })
      .returning()
      .get();

    await setUserSession(event, {
      user: {
        id: numericId,
        login: login,
        name: user.name || user.email,
        avatar: user.picture || '',
      },
    });
    return sendRedirect(event, `/${login}`);
  },
});
