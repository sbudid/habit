<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  link: [
    { rel: 'icon', href: '/icon.png' },
    { rel: 'apple-touch-icon', href: '/icon.png' },
    { rel: 'msapplication-TileImage', href: '/icon.png' },
  ],
});

useSeoMeta({
  title: 'Rutina — Habit Keluarga Indonesia',
  description: 'Aplikasi rutinitas harian untuk pribadi dan keluarga Indonesia. Pantau kebiasaan kecil seperti ibadah, minum air, belajar anak, olahraga ringan, dan rutinitas rumah.',
  ogTitle: 'Rutina — Habit Keluarga Indonesia',
  ogDescription: 'Biar kebiasaan baik nggak cuma jadi niat doang. Track rutinitas pribadi dan keluarga dalam satu tempat.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  twitterCard: 'summary_large_image',
  ogImage: '/social-card.png',
  twitterImage: '/social-card.png',
  ogType: 'website',
  ogSiteName: 'Rutina',
  robots: 'index, follow',
  keywords: 'habit tracker indonesia, aplikasi rutinitas keluarga, tracker kebiasaan, jurnal harian, rutinitas anak, habit keluarga',
});

const { init } = useNotifications();
const showNotifSettings = ref(false);

onMounted(() => {
  init();
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Floating notification settings button -->
  <button
    class="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-lime-400 hover:bg-lime-300 text-lime-950 shadow-lg shadow-lime-500/30 flex items-center justify-center transition-all active:scale-90 animate-bounce-slow"
    @click="showNotifSettings = true"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 004.496 0 25.057 25.057 0 01-4.496 0z" clip-rule="evenodd" />
    </svg>
  </button>

  <!-- Notification settings modal -->
  <UModal v-model="showNotifSettings">
    <NotificationSettings />
  </UModal>

  <!-- PWA update prompt -->
  <PwaReloadPrompt />
</template>

<style>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
</style>
