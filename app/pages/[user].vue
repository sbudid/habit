<script setup lang="ts">
const { session } = useUserSession();
const login = useRoute().params.user as string;
const isMyProfile = computed(() => session.value?.user?.login === login);
const { t, tCategory, lang, initLang } = useI18n();

const fetchUser = () => useRequestFetch()(`/api/users/${login}`) as Promise<User>;
const fetchHabits = () => useRequestFetch()(`/api/users/${login}/habits`) as Promise<Habit[]>;
const fetchMyHabits = () => useRequestFetch()('/api/habits') as Promise<Habit[]>;
const fetchTrash = () => useRequestFetch()('/api/habits/trash') as Promise<Habit[]>;

const { data: user } = useQuery({ key: ['user'], query: fetchUser });
const { data: habits } = useQuery({ key: ['habits'], query: fetchHabits });
const { data: myHabits } = useQuery({
  key: ['my_habits'],
  query: fetchMyHabits,
  enabled: isMyProfile.value,
});
const { data: trash } = useQuery({
  key: ['trash'],
  query: fetchTrash,
  enabled: isMyProfile.value,
});

// Init bahasa dari user preference
watchEffect(() => {
  if (user.value) {
    initLang((user.value as any).lang);
  }
});

const emptyHabits = computed(() => habits.value?.length === 0);
const emptyMyHabits = computed(() => myHabits.value?.length === 0);
const pageTitle = computed(() => (user.value?.login && user.value?.name ? `${user.value.name} (@${user.value.login})` : '404'));

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  ogSiteName: pageTitle,
});

// Filter kategori
const activeCategory = ref('semua');
const CATEGORY_OPTIONS = computed(() => [
  { value: 'semua', label: t('all'), icon: '🗂️' },
  { value: 'umum', label: tCategory('umum'), icon: '📋' },
  { value: 'kesehatan', label: tCategory('kesehatan'), icon: '💪' },
  { value: 'produktivitas', label: tCategory('produktivitas'), icon: '⚡' },
  { value: 'belajar', label: tCategory('belajar'), icon: '📚' },
  { value: 'keuangan', label: tCategory('keuangan'), icon: '💰' },
  { value: 'sosial', label: tCategory('sosial'), icon: '👥' },
  { value: 'kreativitas', label: tCategory('kreativitas'), icon: '🎨' },
]);

const displayHabits = computed(() => {
  const list = isMyProfile.value ? myHabits.value : habits.value;
  if (!list) return [];
  if (activeCategory.value === 'semua') return list;
  return list.filter(h => (h as any).category === activeCategory.value);
});

const hasHabits = computed(() => {
  const list = isMyProfile.value ? myHabits.value : habits.value;
  return list && list.length > 0;
});

// Drag & drop
const queryCache = useQueryCache();
const draggedItem = ref<number | null>(null);

const onDragStart = (id: number) => {
  draggedItem.value = id;
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const onDrop = async (targetId: number) => {
  if (draggedItem.value === null || draggedItem.value === targetId) return;
  const list = [...(myHabits.value || [])];
  const fromIdx = list.findIndex(h => h.id === draggedItem.value);
  const toIdx = list.findIndex(h => h.id === targetId);
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, moved);

  const order = list.map((h, i) => ({ id: h.id, sortOrder: i }));
  await $fetch('/api/habits/reorder', { method: 'POST', body: { order } });
  await queryCache.invalidateQueries({ active: true });
  draggedItem.value = null;
};

// Trash view
const showTrash = ref(false);

// Restore habit
const { mutate: restoreHabit } = useMutation({
  mutation: (id: number) => $fetch(`/api/habits/${id}/restore`, { method: 'POST' }),
  async onSuccess() {
    await queryCache.invalidateQueries({ active: true });
  },
});
</script>

<template>
  <Card v-if="user">
    <div class="relative z-10">
      <ProfileHeader :user="user" />
      <template v-if="!user.userView && !isMyProfile"><PrivateAccount :user="user" /></template>
      <template v-else>
        <!-- Filter Kategori -->
        <div v-if="hasHabits" class="mx-4 mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            v-for="cat in CATEGORY_OPTIONS"
            :key="cat.value"
            @click="activeCategory = cat.value"
            :class="[
              'flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              activeCategory === cat.value
                ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50'
                : 'bg-white/5 text-white/50 hover:bg-white/10',
            ]">
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
          </button>
        </div>
        <div class="scrollable-card max-h-[calc(100vh-21rem)] overflow-y-auto">
          <div
            v-for="habit in displayHabits"
            :key="habit.id"
            :draggable="isMyProfile"
            @dragstart="onDragStart(habit.id)"
            @dragover="onDragOver"
            @drop="onDrop(habit.id)"
            :class="['transition', isMyProfile ? 'cursor-grab active:cursor-grabbing' : '']">
            <HabitCard :habit="habit" :isMyProfile="isMyProfile" />
          </div>
        </div>
        <EmptyHabits v-if="isMyProfile ? emptyMyHabits : emptyHabits" :isMyProfile="isMyProfile" />
        <!-- Tong Sampah -->
        <div v-if="isMyProfile && trash && trash.length > 0" class="mx-4 mt-3">
          <button @click="showTrash = !showTrash" class="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/10">
            <span>{{ t('trash') }} ({{ trash.length }})</span>
            <UIcon :name="showTrash ? 'i-heroicons-chevron-up-16-solid' : 'i-heroicons-chevron-down-16-solid'" class="h-4 w-4" />
          </button>
          <div v-if="showTrash" class="mt-2 flex flex-col gap-2">
            <div v-for="item in trash" :key="item.id" class="mx-4 flex items-center justify-between rounded-xl bg-white/5 p-3">
              <div class="flex flex-col gap-1">
                <div class="text-sm font-medium text-white/70">{{ item.title }}</div>
                <div class="text-xs text-white/40">{{ t('trash') }}</div>
              </div>
              <button @click="restoreHabit(item.id)" class="button bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30">
                {{ t('restore') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </Card>
  <Card v-else class="items-start justify-center gap-7 p-6">
    <div class="relative z-10 flex w-5/6 flex-col gap-5">
      <div class="text-3xl font-semibold">{{ t('notFound') }}</div>
      <p class="font-semibold">{{ t('pageNotFound') }}</p>
      <p class="text-sm text-white/50">{{ t('brokenLink') }}</p>
    </div>
    <a href="/" class="button bg-white/20 px-2.5 py-2 hover:bg-white/30">
      <UIcon name="i-heroicons-arrow-left-16-solid" class="h-5 w-5" />
      {{ t('goBack') }}
    </a>
  </Card>
</template>

<style lang="postcss" scoped>
.scrollbar-none {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
