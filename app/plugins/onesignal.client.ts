export default defineNuxtPlugin(() => {
  // OneSignal SDK loaded via nuxt.config.ts head script
  // Just register the init via OneSignalDeferred (created by SDK)
  if (import.meta.client) {
    const config = useRuntimeConfig();
    const appId = config.public.onesignalAppId as string;
    if (!appId) return;

    // @ts-ignore
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // @ts-ignore
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId,
          serviceWorkerParam: { scope: '/' },
          serviceWorkerPath: 'sw.js',
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
