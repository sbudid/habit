export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (import.meta.client && config.public.onesignalAppId) {
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSdk.page.js';
    script.defer = true;
    script.onload = async () => {
      try {
        // @ts-ignore — OneSignal global from CDN
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        // @ts-ignore
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          await OneSignal.init({
            appId: config.public.onesignalAppId,
            // Use Workbox-generated SW which embeds OneSignal SW via importScripts
            serviceWorkerParam: { scope: '/' },
            serviceWorkerPath: 'sw.js',
            notifyButton: { enable: false },
            welcomeNotification: { disable: true },
          });
        });
      } catch {}
    };
    document.head.appendChild(script);
  }
});
