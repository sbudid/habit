<script setup lang="ts">
import { marked } from 'marked';
import { format, isSameDay, parseISO } from 'date-fns';
import { DEFAULT_HABIT_COLOR, normalizeHabitColor } from '../utils/habitUi.mjs';

const props = defineProps<{ habit: Habit; isMyProfile: boolean }>();
const queryCache = useQueryCache();

const renderMarkdown = (text: string) => marked(text);
const getCompletionRate = (habit: Habit) => Math.min(100, Math.round((habit.completeDays.length / 40) * 100));
const habitColor = computed(() => normalizeHabitColor(props.habit.color));

const openHabitModal = ref(false);
const confirmDeleteHabit = ref(false);
const confirmationText = ref('');
useModalBackButton(openHabitModal);
useModalBackButton(confirmDeleteHabit);

const openDeleteConfirmation = () => {
  confirmDeleteHabit.value = true;
};

const closeDeleteConfirmation = () => {
  confirmationText.value = '';
  confirmDeleteHabit.value = false;
};

const { mutate: deleteHabit } = useMutation({
  mutation: (habit: Habit) => $fetch(`/api/habits/${habit.id}`, { method: 'DELETE' }),
  async onSuccess() {
    closeDeleteConfirmation();
    openHabitModal.value = false;
    await queryCache.invalidateQueries({ active: true });
  },
});

const editingHabit = ref<number | null>(null);
const edit = ref<{ title: string; description: string; habitView: boolean; color: string }>({
  title: '',
  description: '',
  habitView: false,
  color: DEFAULT_HABIT_COLOR,
});

const editHabit = (habit: Habit) => {
  editingHabit.value = habit.id;
  edit.value = {
    title: habit.title,
    description: habit.description || '',
    habitView: habit.habitView,
    color: normalizeHabitColor(habit.color),
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
        color: normalizeHabitColor(edit.value.color),
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
    const completedToday = isTodayCompleted(habit);
    const updatedCompleteDays = completedToday
      ? habit.completeDays.filter(day => !isSameDay(parseISO(day), new Date()))
      : [...habit.completeDays, format(new Date(), 'yyyy-MM-dd')];

    return $fetch(`/api/habits/${habit.id}`, {
      method: 'PATCH',
      body: { completeDays: updatedCompleteDays },
    }) as Promise<Habit>;
  },
  async onSuccess(updatedHabit) {
    await queryCache.invalidateQueries({ active: true });
    if (isTodayCompleted(updatedHabit)) startConfettiAnimation();
  },
});
</script>

<template>
  <ContentBox class="mx-2 mb-1 flex min-h-11 items-center gap-2 rounded-xl bg-neutral-400/5 px-2 py-0.5 transition hover:bg-white/5">
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center gap-2 self-stretch text-left transition active:scale-[.985]"
      :aria-label="`Buka detail ${habit.title}`"
      @click="openHabitModal = true">
      <UIcon name="i-heroicons-bolt-20-solid" class="h-4 w-4 shrink-0 drop-shadow" :style="{ color: habitColor }" />

      <span class="line-clamp-2 min-w-0 break-words text-xs font-semibold leading-4 text-white">
        {{ habit.title }}
      </span>
    </button>

    <HabitHeatmap :habit="habit" :habitDays="14" compact />

    <button
      v-if="isMyProfile"
      type="button"
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition active:scale-90"
      :class="isTodayCompleted(habit) ? 'bg-white/10 text-white/70' : 'text-white shadow-sm'"
      :style="!isTodayCompleted(habit) ? { backgroundColor: habitColor } : undefined"
      :aria-label="isTodayCompleted(habit) ? `Batalkan ${habit.title} hari ini` : `Tandai ${habit.title} selesai hari ini`"
      @click.stop="toggleTodayCompletion(habit)">
      <UIcon :name="isTodayCompleted(habit) ? 'i-heroicons-arrow-uturn-left-16-solid' : 'i-heroicons-check-16-solid'" class="h-5 w-5" />
    </button>
  </ContentBox>

  <UModal
    v-model="openHabitModal"
    :ui="{
      container: 'items-end p-0 sm:items-center sm:p-4',
      width: 'w-full sm:max-w-md',
      background: '',
      shadow: '',
      overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' },
    }">
    <div
      class="max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full overflow-y-auto rounded-t-3xl bg-neutral-950/95 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl">
      <div class="flex flex-col gap-3 p-3">
        <ContentBox class="flex flex-col gap-2.5 bg-white/10 p-2.5 dark:bg-neutral-400/5">
          <div class="flex w-full items-center justify-between gap-2.5 px-0.5 text-white/35">
            <div class="text-xs">
              Selesai:
              <strong>{{ getCompletionRate(habit) }}%</strong>
            </div>
            <UProgress
              :value="getCompletionRate(habit)"
              size="xs"
              :ui="{
                wrapper: 'flex-1',
                progress: {
                  color: 'text-white/25 dark:text-white/15',
                  track:
                    '[&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-bar]:dark:bg-white/5 [@supports(selector(&::-moz-progress-bar))]:bg-white/10 [@supports(selector(&::-moz-progress-bar))]:dark:bg-white/5',
                },
              }" />
            <div class="text-xs">
              Hari ini:
              <strong>{{ isTodayCompleted(habit) ? 'Selesai' : 'Belum' }}</strong>
            </div>
          </div>
          <HabitHeatmap :habit="habit" :habitDays="343" />
        </ContentBox>

        <div class="flex flex-col gap-3 px-1 text-white">
          <div class="flex items-center justify-between gap-2">
            <UInput v-if="editingHabit === habit.id" v-model="edit.title" :ui="{ wrapper: 'flex-1', rounded: 'rounded-full', size: { sm: 'text-sm font-semibold' } }" />
            <div v-else class="flex min-w-0 items-center gap-2">
              <UIcon name="i-heroicons-bolt-20-solid" class="h-4 w-4 shrink-0" :style="{ color: habitColor }" />
              <div class="line-clamp-2 text-lg font-semibold">{{ habit.title }}</div>
            </div>

            <div v-if="isMyProfile" class="flex shrink-0 items-center gap-2">
              <button
                type="button"
                class="button min-h-10 px-3 py-1.5 font-semibold text-white outline-none transition hover:brightness-110"
                :class="isTodayCompleted(habit) ? 'bg-white/10 hover:bg-white/25' : ''"
                :style="!isTodayCompleted(habit) ? { backgroundColor: habitColor } : undefined"
                @click="toggleTodayCompletion(habit)">
                <UIcon v-if="!isTodayCompleted(habit)" name="i-heroicons-check-16-solid" class="h-5 w-5" />
                {{ isTodayCompleted(habit) ? 'Batal' : 'Selesai' }}
              </button>

              <UPopover :popper="{ placement: 'bottom-end' }" :ui="{ background: '', shadow: '', ring: '' }">
                <button type="button" aria-label="Menu rutinitas" class="button h-10 w-10 bg-white/10 p-0 hover:bg-white/25">
                  <UIcon name="i-heroicons-ellipsis-horizontal-20-solid" class="h-5 w-5" />
                </button>
                <template #panel="{ close }">
                  <div class="dropdown">
                    <button
                      type="button"
                      class="m-1 flex min-h-11 w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg p-2 transition hover:bg-black/30"
                      @click="
                        close();
                        editHabit(habit);
                      ">
                      <UIcon name="i-heroicons-pencil-square-20-solid" class="h-5 w-5" />
                      <span>Edit</span>
                    </button>
                    <div class="border-b border-white/5"></div>
                    <button
                      type="button"
                      class="m-1 flex min-h-11 w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg p-2 text-red-500 transition hover:bg-red-900/30"
                      @click="
                        close();
                        openDeleteConfirmation();
                      ">
                      <UIcon name="i-heroicons-trash-20-solid" class="h-5 w-5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>

          <HabitColorPicker v-if="editingHabit === habit.id" v-model="edit.color" compact />

          <ContentBox class="flex flex-col gap-2 bg-white/10 p-3 backdrop-blur-2xl dark:bg-neutral-200/5">
            <div class="flex items-center gap-2 text-xs font-medium text-white/50">
              <p>{{ format(habit.createdAt, 'MMM d, yyyy') }}</p>
              <UIcon v-if="isMyProfile" :name="habit.habitView ? 'i-heroicons-eye-20-solid' : 'i-heroicons-eye-slash-20-solid'" class="-mt-0.5 h-4 w-4" />
            </div>
            <UTextarea v-if="editingHabit === habit.id" v-model="edit.description" autoresize />
            <div v-else class="prose prose-sm prose-invert max-h-52 overflow-y-auto" v-html="renderMarkdown(habit.description || '')"></div>

            <div v-if="editingHabit === habit.id" class="flex min-h-11 items-center justify-end gap-4 text-sm">
              <div>
                Visibilitas:
                <strong>{{ edit.habitView ? 'Publik' : 'Private' }}</strong>
              </div>
              <UToggle v-model="edit.habitView" />
            </div>
          </ContentBox>

          <div v-if="editingHabit === habit.id" class="flex justify-end gap-2">
            <UButton :ui="{ rounded: 'rounded-full' }" color="white" variant="link" @click="cancelEdit">Batal</UButton>
            <UButton :ui="{ rounded: 'rounded-full' }" trailing @click="saveHabit">Simpan</UButton>
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="confirmDeleteHabit" :ui="{ width: 'w-80', rounded: 'rounded-2xl' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Yakin ingin menghapus?</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeDeleteConfirmation" />
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <p v-if="habit.completeDays.length > 1" class="text-sm text-red-500">Rutinitas ini sudah selesai {{ habit.completeDays.length }} hari. Seluruh progres akan terhapus.</p>
          <p class="text-sm text-neutral-400">
            Ketik
            <strong>DELETE</strong>
            untuk konfirmasi.
          </p>
          <UInput v-model="confirmationText" color="red" placeholder="Ketik DELETE..." />
          <UButton block color="red" :disabled="confirmationText.toLowerCase() !== 'delete'" @click="deleteHabit(habit)">Hapus rutinitas</UButton>
        </div>
      </UCard>
    </UModal>
  </UModal>
</template>
