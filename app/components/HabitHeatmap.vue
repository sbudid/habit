<script setup lang="ts">
import { format } from 'date-fns';
import { DEFAULT_HABIT_COLOR, normalizeHabitColor, visibleHistoryDays } from '../utils/habitUi.mjs';

const props = withDefaults(
  defineProps<{
    habit: Habit;
    habitDays: number;
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const compactContainer = ref<HTMLElement | null>(null);
const compactWidth = ref(140);
let resizeObserver: ResizeObserver | undefined;

const allDays = computed(() => generateWeeks(props.habitDays).flat());
const compactDays = computed(() => allDays.value.slice(-visibleHistoryDays(compactWidth.value)));
const today = computed(() => format(new Date(), 'yyyy-MM-dd'));
const habitColor = computed(() => normalizeHabitColor(props.habit.color));

onMounted(() => {
  if (!props.compact || !compactContainer.value) return;

  resizeObserver = new ResizeObserver(entries => {
    compactWidth.value = entries[0]?.contentRect.width ?? compactWidth.value;
  });
  resizeObserver.observe(compactContainer.value);
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<template>
  <div :style="{ '--habit-color': habitColor }">
    <div
      v-if="compact"
      ref="compactContainer"
      class="flex w-[38vw] min-w-[4.5rem] max-w-[8.75rem] shrink-0 items-center justify-end gap-0.5"
      dir="ltr"
      :aria-label="`Riwayat ${compactDays.length} hari terakhir`">
      <UTooltip v-for="day in compactDays" :key="day.date" :popper="{ placement: 'top' }" :ui="{ wrapper: '', background: '', ring: '', shadow: '', base: '' }">
        <div
          :class="[
            'compact-day',
            {
              active: habit.completeDays.includes(day.date),
              today: day.date === today,
            },
          ]"></div>
        <template #text>
          <div :class="['chip', { active: habit.completeDays.includes(day.date) }]">{{ formatDate(day.date) }}{{ day.date === today ? ' · Hari ini' : '' }}</div>
        </template>
      </UTooltip>
    </div>

    <div v-else class="flex h-full overflow-hidden rounded-xl" dir="rtl">
      <div class="flex gap-0.5" dir="ltr">
        <div v-for="(week, weekIndex) in generateWeeks(habitDays)" :key="weekIndex" class="flex flex-col gap-0.5">
          <div v-for="day in week" :key="day.date">
            <UTooltip :popper="{ placement: 'top' }" :ui="{ wrapper: '', background: '', ring: '', shadow: '', base: '' }">
              <div :class="['day', { active: habit.completeDays.includes(day.date), today: day.date === today }]"></div>
              <template #text>
                <div :class="['chip', { active: habit.completeDays.includes(day.date) }]">{{ formatDate(day.date) }}{{ day.date === today ? ' · Hari ini' : '' }}</div>
              </template>
            </UTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.day,
.compact-day {
  @apply flex rounded-sm bg-white/10 transition;

  &.active {
    background-color: var(--habit-color);
    box-shadow: 0 0 5px color-mix(in srgb, var(--habit-color) 50%, transparent);
  }

  &.today {
    outline: 1px solid rgba(255, 255, 255, 0.9);
    outline-offset: 1px;
  }
}

.day {
  @apply h-2.5 w-2.5;
}

.compact-day {
  @apply h-2 w-2 shrink-0 rounded-[2px];
}

.chip {
  font-size: 0.75rem;
  box-shadow:
    inset 0.5px 0.5px 1px 0 rgba(255, 255, 255, 0.1),
    inset -0.5px -0.5px 1px 0 rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.2) 0 3px 10px -5px;
  @apply rounded-lg bg-neutral-900 px-2 py-1 text-white/70;

  &.active {
    background-color: var(--habit-color);
    color: white;
  }
}
</style>
