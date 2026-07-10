<script setup lang="ts">
const props = defineProps<{ habit: Habit }>();
const { t, lang } = useI18n();
const { getStreak, getMaxStreak, getWeeklyData, getMonthlyData, getTotalCompletions } = useStats();

const streak = computed(() => getStreak(props.habit.completeDays));
const maxStreak = computed(() => getMaxStreak(props.habit.completeDays));
const total = computed(() => getTotalCompletions(props.habit.completeDays));
const weeklyData = computed(() => getWeeklyData(props.habit.completeDays));
const monthlyData = computed(() => getMonthlyData(props.habit.completeDays));

const maxWeekly = computed(() => Math.max(...weeklyData.value.map(d => d.count), 1));
const maxMonthly = computed(() => Math.max(...monthlyData.value.map(d => d.count), 1));
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-3 gap-3">
      <ContentBox class="flex flex-col items-center gap-1 bg-white/10 p-3 dark:bg-neutral-200/5">
        <div class="text-2xl font-bold text-green-400">{{ streak }}🔥</div>
        <div class="text-xs text-white/50">{{ t('streak') }}</div>
      </ContentBox>
      <ContentBox class="flex flex-col items-center gap-1 bg-white/10 p-3 dark:bg-neutral-200/5">
        <div class="text-2xl font-bold text-yellow-400">{{ maxStreak }}🏆</div>
        <div class="text-xs text-white/50">{{ t('best') }}</div>
      </ContentBox>
      <ContentBox class="flex flex-col items-center gap-1 bg-white/10 p-3 dark:bg-neutral-200/5">
        <div class="text-2xl font-bold text-blue-400">{{ total }}✅</div>
        <div class="text-xs text-white/50">{{ t('total') }}</div>
      </ContentBox>
    </div>
    <ContentBox class="bg-white/10 p-4 dark:bg-neutral-200/5">
      <div class="mb-3 text-xs font-semibold text-white/50">{{ t('lastWeeks') }}</div>
      <div class="flex items-end gap-1" style="height: 80px">
        <div v-for="(week, i) in weeklyData" :key="i" class="flex flex-1 flex-col items-center gap-1">
          <div class="w-full rounded-t-sm bg-gradient-to-t from-green-600 to-green-400 transition-all" :style="{ height: `${(week.count / maxWeekly) * 60 + (week.count > 0 ? 8 : 0)}px` }"></div>
          <div class="text-[9px] text-white/30">{{ week.label }}</div>
        </div>
      </div>
    </ContentBox>
    <ContentBox class="bg-white/10 p-4 dark:bg-neutral-200/5">
      <div class="mb-3 text-xs font-semibold text-white/50">{{ t('lastMonths') }}</div>
      <div class="flex items-end gap-2" style="height: 80px">
        <div v-for="(month, i) in monthlyData" :key="i" class="flex flex-1 flex-col items-center gap-1">
          <div class="w-full rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-400 transition-all" :style="{ height: `${(month.count / maxMonthly) * 60 + (month.count > 0 ? 8 : 0)}px` }"></div>
          <div class="text-[9px] text-white/30">{{ month.label }}</div>
        </div>
      </div>
    </ContentBox>
  </div>
</template>
