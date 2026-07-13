<script setup lang="ts">
const { loggedIn, session } = useUserSession();

const createHabitModal = ref(false);
useModalBackButton(createHabitModal);

defineProps<{ user: User }>();
const isOwnProfile = computed(() => session.value.user?.login === useRoute().params.user);
</script>

<template>
  <div class="relative flex p-5">
    <div class="flex flex-col gap-3">
      <UAvatar size="3xl" :src="user?.avatarUrl" :alt="user?.login" />

      <div class="flex flex-col gap-1">
        <div class="text-xl font-medium">{{ user?.name || user?.login }}</div>
        <div class="text-xs text-white/40">
          {{ user?.bio || 'Sedang bangun rutinitas kecil yang konsisten.' }}
        </div>
      </div>
    </div>

    <div v-if="isOwnProfile" class="absolute right-5 top-5 flex gap-3">
      <button class="button bg-white/20 py-1.5 pl-2 pr-2.5 hover:bg-white/25" @click="createHabitModal = true">
        <UIcon name="i-heroicons-plus-16-solid" class="h-5 w-5" />
        Tambah
      </button>

      <Dropdown :user="user" />
    </div>

    <div v-else-if="!loggedIn" class="absolute right-5 top-5 flex gap-3">
      <a href="/#masuk" class="button bg-white/20 px-2 py-1.5 hover:bg-white/25">
        <UIcon name="i-heroicons-envelope-20-solid" class="h-5 w-5" />
        Masuk
      </a>
    </div>

    <UModal
      v-model="createHabitModal"
      :ui="{ container: 'items-end p-0 sm:items-center sm:p-4', width: 'w-full sm:max-w-md', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
      <div
    class="relative max-h-dvh w-full overflow-y-auto rounded-t-3xl bg-neutral-950/95 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl"
    style="padding-bottom: env(safe-area-inset-bottom)">
    <button
      type="button"
      aria-label="Tutup form tambah rutinitas"
      class="button absolute right-3 top-3 z-20 h-9 w-9 bg-black/50 text-white hover:bg-black/70"
      @click="createHabitModal = false">
      <UIcon name="i-heroicons-x-mark-20-solid" class="h-5 w-5" />
    </button>

    <HabitForm @habitAdded="createHabitModal = false" />
  </div>
    </UModal>
  </div>
</template>
