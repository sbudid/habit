export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const config = useRuntimeConfig();
    const appId = config.public.onesignalAppId as string;
    if (!appId) return;

    const { session } = useUserSession();

    // @ts-ignore
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // @ts-ignore
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId,
          // Use Workbox sw.js (already imports OneSignalSDK.sw.js)
          // No separate OneSignal SW — prevents scope conflict loop
          serviceWorkerPath: '/sw.js',
          serviceWorkerParam: { scope: '/' },
          notifyButton: { enable: false },
          welcomeNotification: { disable: true },
        });
        console.log('[OneSignal] init OK via Workbox sw.js, app:', appId);

        // Set external user ID for personalized notifications (streak etc.)
        const userId = session.value?.user?.id;
        if (userId) {
          await OneSignal.login(String(userId));
          console.log('[OneSignal] external user ID set:', userId);
        }
      } catch (e) {
        console.warn('[OneSignal] init failed:', e);
      }
    });
  }
});
