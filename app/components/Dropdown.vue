<script setup lang="ts">
const props = defineProps<{ user: User }>();
const { clear } = useUserSession();
const { t, lang, setLang } = useI18n();
const openEditProfile = ref(false);
const openNotifSettings = ref(false);
const openExport = ref(false);
const colorMode = useColorMode();

const { notificationPermission, reminderEnabled, reminderTime, requestPermission, saveReminderSettings, initReminder } = useNotifications();
const localReminder = ref(reminderEnabled.value);
const localTime = ref(reminderTime.value);

onMounted(() => {
  initReminder();
  localReminder.value = reminderEnabled.value;
  localTime.value = reminderTime.value;
});

const isDarkMode = computed({
  get: () => colorMode.preference === 'dark',
  set: () => (colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'),
});

const toggleReminder = async () => {
  if (localReminder.value && notificationPermission.value !== 'granted') {
    const granted = await requestPermission();
    if (!granted) { localReminder.value = false; return; }
  }
  saveReminderSettings(localReminder.value, localTime.value);
};

const updateTime = (e: Event) => {
  localTime.value = (e.target as HTMLInputElement).value;
  saveReminderSettings(localReminder.value, localTime.value);
};

const { exportToJSON, exportToCSV } = useExport();
const fetchMyHabits = () => useRequestFetch()('/api/habits') as Promise<Habit[]>;
const { data: myHabits } = useQuery({ key: ['my_habits_export'], query: fetchMyHabits });
const handleExportJSON = () => { if (myHabits.value) exportToJSON(myHabits.value, props.user.login); };
const handleExportCSV = () => { if (myHabits.value) exportToCSV(myHabits.value, props.user.login); };
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-end' }" :ui="{ background: '', shadow: '', ring: '' }">
    <button class="button bg-white/20 p-1.5 hover:bg-white/25">
      <UIcon name="i-heroicons-cog-8-tooth" class="h-5 w-5" />
    </button>
    <template #panel="{ close }">
      <div class="dropdown">
        <div @click="() => { close(); openEditProfile = true; }" class="m-2 flex w-36 cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-black/30">
          <UAvatar :src="user?.avatarUrl" size="md" />
          <div class="flex flex-col">
            <div class="line-clamp-1 font-medium">{{ user?.name }}</div>
            <div>@{{ user?.login }}</div>
          </div>
        </div>
        <div class="border-b border-white/10"></div>
        <div @click="() => { close(); openNotifSettings = true; }" class="m-1 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-black/30">
          <UIcon name="i-heroicons-bell" class="h-5 w-5" />
          <span>{{ t('reminder') }}</span>
        </div>
        <div class="border-b border-white/5"></div>
        <div @click="() => { close(); openExport = true; }" class="m-1 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-black/30">
          <UIcon name="i-heroicons-arrow-down-tray-20-solid" class="h-5 w-5" />
          <span>{{ t('exportData') }}</span>
        </div>
        <div class="border-b border-white/5"></div>
        <div @click="isDarkMode = !isDarkMode" class="m-1 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-black/30">
          <UIcon :name="colorMode.preference === 'dark' || colorMode.preference === 'system' ? 'i-heroicons-moon' : 'i-heroicons-sun'" class="h-5 w-5" />
          <span>{{ t('darkMode') }}</span>
        </div>
        <div class="border-b border-white/5"></div>
        <div @click="clear()" class="m-1 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-black/30">
          <UIcon name="i-heroicons-arrow-right-on-rectangle-20-solid" class="h-5 w-5" />
          <span>{{ t('signOut') }}</span>
        </div>
      </div>
    </template>
  </UPopover>
  <UModal v-model="openEditProfile" :ui="{ container: 'items-center', width: 'w-96', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
    <ProfileForm :user="user" />
  </UModal>
  <UModal v-model="openNotifSettings" :ui="{ container: 'items-center', width: 'w-80', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
    <ContentBox class="flex flex-col gap-5 bg-white/10 p-6 backdrop-blur-2xl dark:bg-neutral-200/5">
      <div class="text-center text-xl font-semibold">{{ t('dailyReminder') }}</div>
      <div v-if="notificationPermission === 'unsupported'" class="text-center text-sm text-red-400">{{ t('notifUnsupported') }}</div>
      <div v-else class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <div class="text-sm font-semibold text-white">{{ t('enableReminder') }}</div>
            <div class="text-xs text-white/60">{{ t('reminderDesc') }}</div>
          </div>
          <UToggle v-model="localReminder" @update:model-value="toggleReminder" />
        </div>
        <div v-if="localReminder" class="flex flex-col gap-2">
          <div class="text-sm font-semibold text-white">{{ t('reminderTime') }}</div>
          <input type="time" :value="localTime" @input="updateTime" class="w-full rounded-xl bg-white/10 p-3 text-white outline-none focus:bg-white/15" />
        </div>
        <div v-if="notificationPermission === 'denied'" class="text-xs text-red-400">{{ t('notifBlocked') }}</div>
      </div>
    </ContentBox>
  </UModal>
  <UModal v-model="openExport" :ui="{ container: 'items-center', width: 'w-80', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
    <ContentBox class="flex flex-col gap-5 bg-white/10 p-6 backdrop-blur-2xl dark:bg-neutral-200/5">
      <div class="text-center text-xl font-semibold">{{ t('exportTitle') }}</div>
      <p class="text-center text-xs text-white/60">{{ t('exportDesc') }}</p>
      <div class="flex flex-col gap-2">
        <button @click="handleExportJSON" class="button justify-center bg-white/10 px-4 py-3 font-semibold text-white hover:bg-white/20">
          <UIcon name="i-heroicons-code-bracket-20-solid" class="h-5 w-5" />{{ t('exportJSON') }}
        </button>
        <button @click="handleExportCSV" class="button justify-center bg-white/10 px-4 py-3 font-semibold text-white hover:bg-white/20">
          <UIcon name="i-heroicons-table-cells-20-solid" class="h-5 w-5" />{{ t('exportCSV') }}
        </button>
      </div>
      <UButton color="gray" class="justify-center" @click="openExport = false">{{ t('close') }}</UButton>
    </ContentBox>
  </UModal>
</template>

<style lang="postcss">
.dropdown {
  @apply mt-1 flex select-none flex-col rounded-xl border border-white/5 text-sm text-white/80;
  background: hsla(0, 0%, 100%, 0.05);
  box-shadow: 0 24px 32px -12px hsla(0, 0%, 7%, 0.1), inset 2px 4px 16px 0 hsla(0, 0%, 97%, 0.06);
  -webkit-backdrop-filter: blur(50px);
  backdrop-filter: blur(50px);
}
</style>
