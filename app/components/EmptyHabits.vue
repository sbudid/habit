<script setup lang="ts">
defineProps<{ isMyProfile: Boolean }>();

const createHabitModal = ref(false);
</script>

<template>
  <ContentBox class="relative mx-4 mb-4 flex flex-col items-center justify-center overflow-hidden bg-white/5 text-center">
    <div class="absolute flex flex-col gap-0.5">
      <div v-for="row in 14" :key="row" class="flex w-full gap-0.5">
        <div v-for="col in 27" :key="col" class="h-2.5 w-2.5 rounded-sm bg-neutral-600/5"></div>
      </div>
    </div>

    <div v-if="isMyProfile" class="relative z-10 flex flex-col items-center justify-center gap-2 py-7 px-5">
      <button @click="createHabitModal = true" class="button mb-2 bg-lime-300 p-2.5 text-lime-950 hover:bg-lime-200">
        <UIcon name="i-heroicons-plus-16-solid" class="h-6 w-6" />
      </button>

      <div class="font-medium">Belum ada rutinitas</div>
      <div class="max-w-xs text-xs leading-5 text-neutral-400">
        Mulai dari yang kecil dulu: minum air, sholat tepat waktu, baca buku, olahraga ringan, atau rutinitas anak.
      </div>
    </div>

    <div v-else class="relative z-10 flex flex-col items-center justify-center gap-2 py-9">
      <div class="button mb-2 bg-lime-300 p-1.5 text-lime-950">
        <div class="h-8 w-8 rounded-full bg-lime-900 shadow-inner shadow-black/50"></div>
      </div>
      <div class="font-medium">Belum ada rutinitas publik</div>
      <div class="text-xs text-neutral-400">Akun ini belum menampilkan habit untuk publik.</div>
    </div>
  </ContentBox>

  <UModal
    v-model="createHabitModal"
    :ui="{ container: 'items-center', width: 'w-96', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
    <HabitForm @habitAdded="createHabitModal = false" />
  </UModal>
</template>
