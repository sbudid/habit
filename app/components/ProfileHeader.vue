<script setup lang="ts">
const { loggedIn, session } = useUserSession();
const createHabitModal = ref(false);
useModalBackButton(createHabitModal);

defineProps<{ user: User }>();
const isOwnProfile = computed(() => session.value.user?.login === useRoute().params.user);
</script>

<template>
  <div class="relative flex items-center gap-2 px-3 py-2.5">
    <div class="flex min-w-0 flex-1 items-center gap-2.5">
      <UAvatar size="lg" :src="user?.avatarUrl" :alt="user?.login" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold">{{ user?.name || user?.login }}</div>
        <div class="truncate text-[11px] text-white/45">
          {{ user?.bio || 'Sedang bangun rutinitas kecil yang konsisten.' }}
        </div>
      </div>
    </div>

    <div v-if="isOwnProfile" class="ml-auto flex shrink-0 gap-1.5">
      <button type="button" aria-label="Tambah rutinitas" title="Tambah rutinitas" class="button h-11 w-11 bg-white/20 p-0 hover:bg-white/25" @click="createHabitModal = true">
        <UIcon name="i-heroicons-plus-16-solid" class="h-5 w-5" />
      </button>
      <Dropdown :user="user" />
    </div>

    <div v-else-if="!loggedIn" class="ml-auto flex shrink-0">
      <a href="/#masuk" aria-label="Masuk" class="button h-11 bg-white/20 px-3 hover:bg-white/25">
        <UIcon name="i-heroicons-envelope-20-solid" class="h-5 w-5" />
        <span class="hidden min-[360px]:inline">Masuk</span>
      </a>
    </div>

    <UModal
      v-model="createHabitModal"
      :ui="{
        container: 'items-end p-0 sm:items-center sm:p-4',
        width: 'w-full sm:max-w-md',
        background: '',
        shadow: '',
        overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' },
      }">
      <div
        class="relative max-h-[calc(100dvh-env(safe-area-inset-top))] w-full overflow-y-auto rounded-t-3xl bg-neutral-950/95 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl"
        style="padding-bottom: max(1rem, env(safe-area-inset-bottom))">
        <button
          type="button"
          aria-label="Tutup form tambah rutinitas"
          class="button absolute right-3 top-3 z-20 h-11 w-11 bg-black/50 p-0 text-white hover:bg-black/70"
          @click="createHabitModal = false">
          <UIcon name="i-heroicons-x-mark-20-solid" class="h-5 w-5" />
        </button>
        <HabitForm @habitAdded="createHabitModal = false" />
      </div>
    </UModal>
  </div>
</template>
