export default defineNuxtPlugin(() => {
  // OneSignal SDK loaded via nuxt.config.ts app.head.script
  // OneSignalSDKWorker.js handles push events in SW
  // This plugin initializes OneSignal once SDK is ready
  if (import.meta.client) {
    const config = useRuntimeConfig();
    const appId = config.public.onesignalAppId as string;
    if (!appId) return;

    // @ts-ignore — OneSignalDeferred is created by OneSignal SDK
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // @ts-ignore
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId,
          // Let OneSignal use its own SW (OneSignalSDKWorker.js at /)
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
