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
  <UButton
    icon="i-heroicons-bell"
    color="gray"
    variant="ghost"
    size="sm"
    class="fixed bottom-4 right-4 z-50 shadow-lg bg-white dark:bg-gray-800 rounded-full"
    @click="showNotifSettings = true"
  />

  <!-- Notification settings modal -->
  <UModal v-model="showNotifSettings">
    <NotificationSettings />
  </UModal>

  <!-- PWA update prompt -->
  <PwaReloadPrompt />
</template>
