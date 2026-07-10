<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  link: [
    { rel: 'icon', href: '/icon.png' },
    { rel: 'apple-touch-icon', href: '/icon.png' },
    { rel: 'msapplication-TileImage', href: '/icon.png' },
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'theme-color', content: '#22c55e' },
  ],
  meta: [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
  ],
});

useSeoMeta({
  title: 'Habit - Pelacak Kebiasaan',
  description: 'Aplikasi pelacak kebiasaan minimalis untuk melacak dan mengelola kebiasaan harian Anda dengan mudah',
  ogTitle: 'Habit - Pelacak Kebiasaan',
  ogDescription: 'Aplikasi pelacak kebiasaan minimalis untuk melacak dan mengelola kebiasaan harian Anda dengan mudah',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  twitterCard: 'summary_large_image',
  ogImage: '/social-card.png',
  twitterImage: '/social-card.png',
  ogType: 'website',
  ogUrl: 'https://habit.nuxt.dev',
  ogSiteName: 'Habit - Pelacak Kebiasaan',
  twitterCreator: '@ZHatlen',
  twitterSite: '@ZHatlen',
  robots: 'index, follow',
  keywords: 'kebiasaan, pelacak, harian, manajemen, alat, minimalis, habit tracker',
});

// Register Service Worker untuk PWA & offline
if (import.meta.client && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
