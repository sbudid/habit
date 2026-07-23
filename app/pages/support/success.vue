<script setup lang="ts">
const { checkStatus } = useSupporter();

onMounted(async () => {
  await checkStatus();
});
</script>

<template>
  <Container>
    <div class="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div class="text-6xl">🎉</div>
      <h1 class="text-2xl font-bold">Terima kasih!</h1>
      <p class="text-white/60 max-w-sm">
        Dukungan kamu membantu Rutina terus berkembang. Unlimited habit sudah aktif!
      </p>
      <UButton to="/" color="primary" size="lg">
        Kembali ke Dashboard
      </UButton>
    </div>
  </Container>
</template>
