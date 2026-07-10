<script setup lang="ts">
import { marked } from 'marked';
import { isSameDay, parseISO, format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
const queryCache = useQueryCache();
const { t, tCategory, lang } = useI18n();

defineProps<{ habit: Habit; isMyProfile: Boolean }>();

const renderMarkdown = (text: string) => marked(text);

const locale = computed(() => lang.value === 'id' ? idLocale : enUS);

const getCompletionRate = (habit: Habit) => Math.round((habit.completeDays.length / ((habit as any).targetDays || 40)) * 100);

const openHabitModal = ref(false);
const showStats = ref(false);

// Hapus kebiasaan
const confirmDeleteHabit = ref(false);
const confirmationText = ref('');

const openDeleteConfirmation = (habit: Habit) => {
  confirmDeleteHabit.value = true;
};

const closeDeleteConfirmation = () => {
  confirmationText.value = '';
  confirmDeleteHabit.value = false;
};

const deleteConfirmText = computed(() => lang.value === 'id' ? 'hapus' : 'delete');

const { mutate: deleteHabit } = useMutation({
  mutation: (habit: Habit) => $fetch(`/api/habits/${habit.id}`, { method: 'DELETE' }),
  async onSuccess() {
    await queryCache.invalidateQueries({ active: true });
    confirmDeleteHabit.value = false;
  },
});

// Edit kebiasaan
const editingHabit = ref<number | null>(null);
const edit = ref<{ title: string; description: string; habitView: boolean; category: string; targetDays: number }>({
  title: '', description: '', habitView: false, category: 'umum', targetDays: 40,
});

const editHabit = (habit: Habit) => {
  editingHabit.value = habit.id;
  edit.value = {
    title: habit.title,
    description: habit.description || '',
    habitView: habit.habitView,
    category: (habit as any).category || 'umum',
    targetDays: (habit as any).targetDays || 40,
  };
};

const { mutate: saveHabit } = useMutation({
  mutation: () =>
    $fetch(`/api/habits/${editingHabit.value}`, {
      method: 'PATCH',
      body: {
        title: edit.value.title,
        description: edit.value.description,
        habitView: edit.value.habitView,
        category: edit.value.category,
        targetDays: edit.value.targetDays,
      },
    }),
  async onSuccess() {
    await queryCache.invalidateQueries({ active: true });
    editingHabit.value = null;
  },
});

const cancelEdit = () => {
  editingHabit.value = null;
};

const isTodayCompleted = (habit: Habit) => habit.completeDays.some(day => isSameDay(parseISO(day), new Date()));

const { mutate: toggleTodayCompletion } = useMutation({
  mutation: (habit: Habit) => {
    const isCompletedToday = habit.completeDays.some(day => isSameDay(parseISO(day), new Date()));
    const updatedCompleteDays = isCompletedToday
      ? habit.completeDays.filter(day => !isSameDay(parseISO(day), new Date()))
      : [...habit.completeDays, format(new Date(), 'yyyy-MM-dd')];
    return $fetch(`/api/habits/${habit.id}`, {
      method: 'PATCH',
      body: { completeDays: updatedCompleteDays },
    });
  },
  async onSuccess(habit) {
    await queryCache.invalidateQueries({ active: true });
    if (habit.completeDays.some(day => isSameDay(parseISO(day), new Date()))) {
      startConfettiAnimation();
    }
  },
});

const TARGET_OPTIONS = [
  { value: 7, label: '7 hari' },
  { value: 14, label: '14 hari' },
  { value: 30, label: '30 hari' },
  { value: 40, label: '40 hari' },
  { value: 90, label: '90 hari' },
  { value: 180, label: '180 hari' },
  { value: 365, label: '365 hari' },
];

const CATEGORIES_MAP: Record<string, { label: string; labelEn: string; icon: string }> = {
  umum: { label: 'Umum', labelEn: 'General', icon: '📋' },
  kesehatan: { label: 'Kesehatan', labelEn: 'Health', icon: '💪' },
  produktivitas: { label: 'Produktivitas', labelEn: 'Productivity', icon: '⚡' },
  belajar: { label: 'Belajar', labelEn: 'Learning', icon: '📚' },
  keuangan: { label: 'Keuangan', labelEn: 'Finance', icon: '💰' },
  sosial: { label: 'Sosial', labelEn: 'Social', icon: '👥' },
  kreativitas: { label: 'Kreativitas', labelEn: 'Creativity', icon: '🎨' },
};
</script>

<template>
  <ContentBox class="mx-4 mb-4 flex cursor-pointer gap-3 bg-neutral-400/5 p-3 transition hover:bg-white/5 active:scale-[.975]" @click="openHabitModal = true">
    <div class="flex flex-1 flex-col justify-center gap-1">
      <div class="flex items-center gap-2">
        <span v-if="CATEGORIES_MAP[(habit as any).category || 'umum']" class="text-xs">{{ CATEGORIES_MAP[(habit as any).category || 'umum'].icon }}</span>
        <div class="text-md line-clamp-1 font-medium text-white">{{ habit.title }}</div>
      </div>
      <div class="line-clamp-3 text-xs text-white/70" v-html="renderMarkdown(habit.description || '')"></div>
    </div>
    <HabitHeatmap :habit="habit" :habitDays="49" />
  </ContentBox>
  <UModal
    v-model="openHabitModal"
    :ui="{ container: 'items-center', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
    <div class="flex flex-col gap-4">
      <ContentBox class="flex flex-col gap-2.5 bg-white/10 p-2.5 dark:bg-neutral-400/5">
        <div class="flex w-full items-center justify-between gap-2.5 px-0.5 text-white/25 dark:text-white/15">
          <div class="text-xs">
            {{ t('completionRate') }}:
            <strong>{{ getCompletionRate(habit) }}%</strong>
          </div>
          <UProgress
            :value="getCompletionRate(habit)"
            size="xs"
            :ui="{
              wrapper: 'flex-1',
              progress: {
                color: 'text-white/25 dark:text-white/15',
                track: '[&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-bar]:dark:bg-white/5',
              },
            }" />
          <div class="text-xs">
            {{ t('today') }}:
            <strong>{{ isTodayCompleted(habit) ? t('completed') : t('pending') }}</strong>
          </div>
        </div>
        <HabitHeatmap :habit="habit" :habitDays="343" />
      </ContentBox>
      <!-- Streak & Stats -->
      <div class="px-1">
        <button @click="showStats = !showStats" class="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/10">
          <span>{{ t('streakStats') }}</span>
          <UIcon :name="showStats ? 'i-heroicons-chevron-up-16-solid' : 'i-heroicons-chevron-down-16-solid'" class="h-4 w-4" />
        </button>
        <HabitStats v-if="showStats" :habit="habit" class="mt-2" />
      </div>
      <div class="flex flex-col gap-4 px-3 text-white">
        <div class="flex items-center justify-between gap-3">
          <UInput v-if="editingHabit === habit.id" :ui="{ wrapper: 'flex-1', rounded: 'rounded-full', size: { sm: 'text-sm font-semibold' } }" v-model="edit.title" />
          <div v-else class="line-clamp-1 text-xl font-semibold">{{ habit.title }}</div>
          <div v-if="isMyProfile" class="flex items-center gap-3">
            <button
              @click="toggleTodayCompletion(habit)"
              class="button px-2.5 py-1.5 font-semibold outline-none"
              :class="isTodayCompleted(habit) ? 'bg-white/10 hover:bg-white/25' : 'bg-green-500 hover:bg-green-400 dark:bg-green-400 dark:text-green-950 dark:hover:bg-green-300'">
              <UIcon v-if="!isTodayCompleted(habit)" name="i-heroicons-check-16-solid" class="h-5 w-5" />
              {{ isTodayCompleted(habit) ? t('undo') : t('complete') }}
            </button>
            <UPopover :popper="{ placement: 'bottom-end' }" :ui="{ background: '', shadow: '', ring: '' }">
              <button class="button bg-white/10 p-1.5 hover:bg-white/25">
                <UIcon name="i-heroicons-ellipsis-horizontal-20-solid" class="h-5 w-5" />
              </button>
              <template #panel="{ close }">
                <div class="dropdown">
                  <div @click="() => { close(); editHabit(habit); }" class="m-1 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-black/30">
                    <UIcon name="i-heroicons-pencil-square-20-solid" class="h-5 w-5" />
                    <span>{{ t('edit') }}</span>
                  </div>
                  <div class="border-b border-white/5"></div>
                  <div @click="() => { close(); openDeleteConfirmation(habit); }" class="m-1 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-black/30 dark:text-red-500 dark:hover:bg-red-900/30">
                    <UIcon name="i-heroicons-trash-20-solid" class="h-5 w-5" />
                    <span>{{ t('delete') }}</span>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
        <ContentBox class="flex flex-col gap-2 bg-white/10 p-4 backdrop-blur-2xl dark:bg-neutral-200/5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-medium text-white/50">
              <p>{{ format(habit.createdAt, 'd MMMM yyyy', { locale }) }}</p>
              <UIcon v-if="isMyProfile" :name="habit.habitView ? 'i-heroicons-eye-20-solid' : 'i-heroicons-eye-slash-20-solid'" class="-mt-0.5 h-4 w-4" />
            </div>
          </div>
          <div class="max-h-[calc(100vh-23rem)] overflow-y-auto">
            <UTextarea v-if="editingHabit === habit.id" v-model="edit.description" autoresize />
            <div v-else class="prose prose-sm prose-invert" v-html="renderMarkdown(habit.description || '')"></div>
          </div>
          <div v-if="editingHabit === habit.id" class="mt-3 flex flex-col gap-3">
            <!-- Edit Target -->
            <div class="flex flex-col gap-2">
              <div class="text-xs font-medium text-white/50">Target hari:</div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="opt in TARGET_OPTIONS"
                  :key="opt.value"
                  type="button"
                  @click="edit.targetDays = opt.value"
                  :class="[
                    'rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                    edit.targetDays === opt.value
                      ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                      : 'bg-white/10 text-white/60 hover:bg-white/15',
                  ]">
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <!-- Edit Kategori -->
            <div class="flex flex-col gap-2">
              <div class="text-xs font-medium text-white/50">{{ t('category') }}:</div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="(cat, key) in CATEGORIES_MAP"
                  :key="key"
                  type="button"
                  @click="edit.category = key"
                  :class="[
                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                    edit.category === key
                      ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50'
                      : 'bg-white/10 text-white/60 hover:bg-white/15',
                  ]">
                  <span>{{ cat.icon }}</span>
                  <span>{{ lang === 'id' ? cat.label : cat.labelEn }}</span>
                </button>
              </div>
            </div>
            <!-- Edit Visibilitas -->
            <div class="flex items-center justify-between">
              <div></div>
              <div class="flex items-center gap-4 text-sm">
                <div>{{ t('visibility') }}: <strong>{{ edit.habitView ? t('public') : t('private') }}</strong></div>
                <UToggle v-model="edit.habitView" />
              </div>
            </div>
          </div>
        </ContentBox>
        <div v-if="editingHabit === habit.id" class="flex items-center justify-between">
          <div></div>
          <div class="flex gap-2">
            <UButton :ui="{ rounded: 'rounded-full' }" @click="cancelEdit" color="white" variant="link">{{ t('cancel') }}</UButton>
            <UButton :ui="{ rounded: 'rounded-full' }" @click="saveHabit" trailing>{{ t('save') }}</UButton>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Hapus -->
    <UModal v-model="confirmDeleteHabit" :ui="{ width: 'w-80', rounded: 'rounded-2xl' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">{{ t('confirmDelete') }}</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeDeleteConfirmation" />
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <p v-if="habit.completeDays.length > 1" class="text-sm text-red-500">
            {{ t('deleteWarning', { n: habit.completeDays.length }) }}
          </p>
          <p class="text-sm text-neutral-400" v-html="t('typeDelete')"></p>
          <UInput color="red" v-model="confirmationText" :placeholder="t('typeDeleteHere')" />
          <UButton block color="red" :disabled="confirmationText.toLowerCase() !== deleteConfirmText" @click="deleteHabit(habit)">{{ t('understandDelete') }}</UButton>
        </div>
      </UCard>
    </UModal>
  </UModal>
</template>
