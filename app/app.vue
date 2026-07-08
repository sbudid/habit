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
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
