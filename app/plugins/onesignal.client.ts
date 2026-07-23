export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const config = useRuntimeConfig();
    const appId = config.public.onesignalAppId as string;
    if (!appId) return;

    // @ts-ignore
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // @ts-ignore
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        // OneSignal registers its own SW (OneSignalSDKWorker.js) — no conflict with Workbox sw.js
        await OneSignal.init({
          appId,
          serviceWorkerParam: { scope: '/' },
          notifyButton: { enable: false },
          welcomeNotification: { disable: true },
        });
        console.log('[OneSignal] init OK, app:', appId);
      } catch (e) {
        console.warn('[OneSignal] init failed:', e);
      }
    });
  }
});
