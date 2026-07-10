export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    // Generate consistent numeric ID from Google sub (string UUID)
    const googleId = user.sub || '';
    let numericId = 0;
    for (let i = 0; i < googleId.length; i++) {
      numericId = ((numericId << 5) - numericId + googleId.charCodeAt(i)) | 0;
    }
    numericId = Math.abs(numericId);

    const login = (user.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') || `user${numericId}`;

    await useDB()
      .insert(tables.users)
      .values({
        id: numericId,
        login: login,
        name: user.name || login,
        bio: '',
        avatarUrl: user.picture || '',
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: tables.users.login,
        set: {
          name: user.name || login,
          avatarUrl: user.picture || '',
        },
      })
      .returning()
      .get();

    await setUserSession(event, {
      user: {
        id: numericId,
        login: login,
        name: user.name || login,
        avatar_url: user.picture || '',
      },
    });

    return sendRedirect(event, `/${login}`);
  },
});
