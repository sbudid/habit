<script setup lang="ts">
import { getHabitScheduleState, sortHabitsForToday } from '../utils/habitSchedule.mjs';
import { canReorderHabit, moveHabitIds, reorderHabitIds } from '../utils/habitReorder.mjs';

const { session } = useUserSession();
const queryCache = useQueryCache();
const login = useRoute().params.user as string;

const isMyProfile = computed(() => session.value?.user?.login === login);

const fetchUser = () => useRequestFetch()(`/api/users/${login}`) as Promise<DatabaseUser>;
const fetchHabits = () => useRequestFetch()(`/api/users/${login}/habits`) as Promise<Habit[]>;
const fetchMyHabits = () => useRequestFetch()('/api/habits') as Promise<Habit[]>;

const { data: user } = useQuery({ key: ['user'], query: fetchUser });
const { data: habits } = useQuery({ key: ['habits'], query: fetchHabits });

const { data: myHabits } = useQuery({
  key: ['my_habits'],
  query: fetchMyHabits,
  enabled: isMyProfile.value,
});

const emptyHabits = computed(() => habits.value?.length === 0);
const emptyMyHabits = computed(() => myHabits.value?.length === 0);
const timeZone = ref('UTC');
const scheduleNow = ref(new Date());
const displayedHabits = ref<Habit[]>([]);
const habitList = ref<HTMLElement | null>(null);
const draggedHabitId = ref<number | null>(null);
let orderBeforeDrag: Habit[] = [];
let saveSequence = 0;
let midnightTimer: ReturnType<typeof setTimeout> | undefined;

const sourceHabits = computed(() => (isMyProfile.value ? myHabits.value : habits.value) ?? []);
const activeGroups = computed(
  () => new Map(displayedHabits.value.map(habit => [habit.id, getHabitScheduleState(habit, { now: scheduleNow.value, timeZone: timeZone.value }).isActiveToday])),
);

function armMidnightRefresh() {
  if (midnightTimer) clearTimeout(midnightTimer);
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 50);
  midnightTimer = setTimeout(() => {
    scheduleNow.value = new Date();
    armMidnightRefresh();
  }, nextMidnight.getTime() - Date.now());
}

onMounted(() => {
  timeZone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  scheduleNow.value = new Date();
  armMidnightRefresh();
});
onBeforeUnmount(() => {
  if (midnightTimer) clearTimeout(midnightTimer);
});

watch(
  [sourceHabits, timeZone, scheduleNow],
  ([nextHabits, zone, now]) => {
    if (draggedHabitId.value !== null) return;
    displayedHabits.value = sortHabitsForToday(nextHabits, { timeZone: zone, now });
  },
  { immediate: true, deep: true },
);

function applyIds(ids: number[]) {
  const byId = new Map(displayedHabits.value.map(habit => [habit.id, habit]));
  displayedHabits.value = ids.map(id => byId.get(id)).filter((habit): habit is Habit => Boolean(habit));
}

async function persistOrder(previous: Habit[]) {
  const sequence = ++saveSequence;
  const orderedIds = displayedHabits.value.map(habit => habit.id);
  try {
    await $fetch('/api/habits/reorder', { method: 'PATCH', body: { orderedIds } });
    if (sequence === saveSequence) await queryCache.invalidateQueries({ key: ['my_habits'] });
  } catch {
    if (sequence === saveSequence) displayedHabits.value = previous;
  }
}

function moveHabit(id: number, direction: -1 | 1) {
  const previous = [...displayedHabits.value];
  const currentIndex = previous.findIndex(habit => habit.id === id);
  const target = previous[currentIndex + direction];
  if (!target || !canReorderHabit(activeGroups.value, id, target.id)) return;
  applyIds(moveHabitIds(previous.map(habit => habit.id), id, direction));
  if (displayedHabits.value.some((habit, index) => habit.id !== previous[index]?.id)) void persistOrder(previous);
}

function startDrag(id: number) {
  draggedHabitId.value = id;
  orderBeforeDrag = [...displayedHabits.value];
}

function moveDrag(point: { x: number; y: number }) {
  if (draggedHabitId.value === null) return;
  const target = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>('[data-habit-id]');
  const targetId = Number(target?.dataset.habitId);
  if (Number.isInteger(targetId) && targetId !== draggedHabitId.value && canReorderHabit(activeGroups.value, draggedHabitId.value, targetId)) {
    applyIds(reorderHabitIds(displayedHabits.value.map(habit => habit.id), draggedHabitId.value, targetId));
  }

  const bounds = habitList.value?.getBoundingClientRect();
  if (bounds && point.y < bounds.top + 48) habitList.value?.scrollBy({ top: -36, behavior: 'smooth' });
  if (bounds && point.y > bounds.bottom - 48) habitList.value?.scrollBy({ top: 36, behavior: 'smooth' });
}

function endDrag() {
  if (draggedHabitId.value === null) return;
  const changed = displayedHabits.value.some((habit, index) => habit.id !== orderBeforeDrag[index]?.id);
  draggedHabitId.value = null;
  if (changed) void persistOrder(orderBeforeDrag);
}

function canMove(index: number, direction: -1 | 1) {
  const source = displayedHabits.value[index];
  const target = displayedHabits.value[index + direction];
  return Boolean(source && target && canReorderHabit(activeGroups.value, source.id, target.id));
}

const pageTitle = computed(() => (user.value?.login && user.value?.name ? `${user.value.name} (@${user.value.login}) · Rutina` : 'Halaman tidak ditemukan · Rutina'));

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  ogSiteName: 'Rutina',
});
</script>

<template>
  <Card v-if="user">
    <div class="relative z-10">
      <ProfileHeader :user="user" />

      <template v-if="!user.userView && !isMyProfile">
        <PrivateAccount :user="user" />
      </template>

      <template v-else>
        <div ref="habitList" class="scrollable-card max-h-[calc(100dvh-5.75rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto px-1 pb-2">
          <HabitCard
            v-for="(habit, index) in displayedHabits"
            :key="habit.id"
            :habit="habit"
            :isMyProfile="isMyProfile"
            :timeZone="timeZone"
            :now="scheduleNow"
            :canMoveUp="canMove(index, -1)"
            :canMoveDown="canMove(index, 1)"
            @moveUp="moveHabit($event, -1)"
            @moveDown="moveHabit($event, 1)"
            @dragStart="startDrag"
            @dragMove="moveDrag"
            @dragEnd="endDrag" />
        </div>

        <EmptyHabits v-if="isMyProfile ? emptyMyHabits : emptyHabits" :isMyProfile="isMyProfile" />
      </template>
    </div>
  </Card>

  <Card v-else class="items-start justify-center gap-7 p-6">
    <div class="relative z-10 flex w-5/6 flex-col gap-5">
      <div class="text-3xl font-semibold">404</div>
      <p class="font-semibold">Halaman ini nggak ketemu.</p>
      <p class="text-sm text-white/50">Link-nya mungkin salah, atau profilnya belum dibuat.</p>
    </div>
    <a href="/" class="button bg-white/20 px-2.5 py-2 hover:bg-white/30">
      <UIcon name="i-heroicons-arrow-left-16-solid" class="h-5 w-5" />
      Balik ke Rutina
    </a>
  </Card>
</template>
