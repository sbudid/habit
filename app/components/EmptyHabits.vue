<script setup lang="ts">
defineProps<{ isMyProfile: Boolean }>();
const createHabitModal = ref(false);

useModalBackButton(createHabitModal);
const { t } = useI18n();
</script>

<template>
  <ContentBox class="relative mx-4 mb-4 flex flex-col items-center justify-center overflow-hidden bg-white/5 text-center">
    <div class="absolute flex flex-col gap-0.5">
      <div v-for="row in 14" :key="row" class="flex w-full gap-0.5">
        <div v-for="col in 27" :key="col" class="h-2.5 w-2.5 rounded-sm bg-neutral-600/5"></div>
      </div>
    </div>
    <div v-if="isMyProfile" class="flex flex-col items-center justify-center gap-2 py-6">
      <button @click="createHabitModal = true" class="button mb-2 bg-green-400 p-2.5 text-green-950 hover:bg-green-300">
        <UIcon name="i-heroicons-plus-16-solid" class="h-6 w-6" />
      </button>
      <div class="font-medium">{{ t('noHabits') }}</div>
      <div class="text-xs text-neutral-400">{{ t('noHabitsDesc') }}</div>
    </div>
    <div v-else class="flex flex-col items-center justify-center gap-2 py-9">
      <div class="button mb-2 bg-green-400 p-1.5 text-green-950">
        <div class="h-8 w-8 rounded-full bg-green-900 shadow-inner shadow-black/50"></div>
      </div>
      <div class="font-medium">{{ t('noVisible') }}</div>
    </div>
  </ContentBox>
  <UModal v-model="createHabitModal" :ui="{ container: 'items-end p-0 sm:items-center sm:p-4', width: 'w-full sm:max-w-md', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
    <div
    class="relative max-h-dvh w-full overflow-y-auto rounded-t-3xl bg-neutral-950/95 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl"
    style="padding-bottom: env(safe-area-inset-bottom)">
    <button
      type="button"
      aria-label="Tutup form tambah rutinitas"
      class="button absolute right-3 top-3 z-20 h-9 w-9 bg-black/50 text-white hover:bg-black/70"
      @click="createHabitModal = false">
      <UIcon
        name="i-heroicons-x-mark-20-solid"
        class="h-5 w-5"
      />
    </button>

    <HabitForm @habitAdded="createHabitModal = false" />
  </div>
  </UModal>
</template>
