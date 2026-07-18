const SCHEDULE_TYPES = new Set(['daily', 'specific_days', 'times_per_week', 'interval_days']);

function clampInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function parseScheduleDays(value) {
  let days = value;
  if (typeof days === 'string') {
    try {
      days = JSON.parse(days);
    } catch {
      days = [];
    }
  }
  if (!Array.isArray(days)) return [];
  return [...new Set(days.map(Number).filter(day => Number.isInteger(day) && day >= 1 && day <= 7))].sort((a, b) => a - b);
}

export function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function dateKeyInTimezone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function differenceDays(left, right) {
  const leftTime = Date.parse(`${left}T12:00:00.000Z`);
  const rightTime = Date.parse(`${right}T12:00:00.000Z`);
  return Math.round((leftTime - rightTime) / 86_400_000);
}

function isoWeekday(dateKey) {
  const sundayBased = new Date(`${dateKey}T12:00:00.000Z`).getUTCDay();
  return sundayBased === 0 ? 7 : sundayBased;
}

function startOfIsoWeek(dateKey) {
  return addDays(dateKey, 1 - isoWeekday(dateKey));
}

function formatNextDate(dateKey) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
}

export function normalizeHabitSchedule(habit = {}) {
  const rawType = habit.scheduleType ?? habit.schedule_type;
  const scheduleType = SCHEDULE_TYPES.has(rawType) ? rawType : 'daily';
  const rawDays = habit.scheduleDays ?? habit.schedule_days;
  const scheduleDays = parseScheduleDays(rawDays);
  const weeklyTarget = clampInteger(habit.weeklyTarget ?? habit.weekly_target, 1, 1, 7);
  const intervalDays = clampInteger(habit.intervalDays ?? habit.interval_days, 2, 2, 365);
  const rawStartDate = habit.scheduleStartDate ?? habit.schedule_start_date;
  const scheduleStartDate = isValidDateKey(rawStartDate) ? rawStartDate : null;

  return {
    scheduleType: scheduleType === 'specific_days' && scheduleDays.length === 0 ? 'daily' : scheduleType,
    scheduleDays,
    weeklyTarget,
    intervalDays,
    scheduleStartDate,
  };
}

export function getHabitScheduleState(habit, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const timeZone = options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const todayKey = dateKeyInTimezone(now, timeZone);
  const schedule = normalizeHabitSchedule(habit);
  const completions = Array.isArray(habit.completeDays) ? habit.completeDays : [];

  if (schedule.scheduleType === 'daily') {
    return { ...schedule, todayKey, isActiveToday: true, label: 'Setiap hari', nextDate: todayKey, weeklyProgress: null };
  }

  if (schedule.scheduleType === 'specific_days') {
    const active = schedule.scheduleDays.includes(isoWeekday(todayKey));
    let nextDate = todayKey;
    if (!active) {
      for (let offset = 1; offset <= 7; offset += 1) {
        const candidate = addDays(todayKey, offset);
        if (schedule.scheduleDays.includes(isoWeekday(candidate))) {
          nextDate = candidate;
          break;
        }
      }
    }
    return {
      ...schedule,
      todayKey,
      isActiveToday: active,
      nextDate,
      weeklyProgress: null,
      label: active ? 'Terjadwal hari ini' : `Berikutnya: ${formatNextDate(nextDate)}`,
    };
  }

  if (schedule.scheduleType === 'times_per_week') {
    const weekStart = startOfIsoWeek(todayKey);
    const weekEnd = addDays(weekStart, 6);
    const weeklyProgress = completions.filter(day => day >= weekStart && day <= weekEnd).length;
    const active = weeklyProgress < schedule.weeklyTarget;
    const nextDate = active ? todayKey : addDays(weekStart, 7);
    return {
      ...schedule,
      todayKey,
      isActiveToday: active,
      nextDate,
      weeklyProgress,
      label: `${weeklyProgress}/${schedule.weeklyTarget} minggu ini`,
    };
  }

  const fallbackStart = habit.createdAt ? dateKeyInTimezone(new Date(habit.createdAt), timeZone) : todayKey;
  const startDate = schedule.scheduleStartDate || fallbackStart;
  const elapsed = differenceDays(todayKey, startDate);
  const active = elapsed >= 0 && elapsed % schedule.intervalDays === 0;
  let nextDate = startDate;
  if (elapsed >= 0) {
    const remainder = elapsed % schedule.intervalDays;
    nextDate = active ? todayKey : addDays(todayKey, schedule.intervalDays - remainder);
  }

  return {
    ...schedule,
    scheduleStartDate: startDate,
    todayKey,
    isActiveToday: active,
    nextDate,
    weeklyProgress: null,
    label: active ? `Hari ini · setiap ${schedule.intervalDays} hari` : `Berikutnya: ${formatNextDate(nextDate)}`,
  };
}

export function sortHabitsForToday(habits, options = {}) {
  return [...habits].sort((left, right) => {
    const activeDifference = Number(getHabitScheduleState(right, options).isActiveToday) - Number(getHabitScheduleState(left, options).isActiveToday);
    if (activeDifference !== 0) return activeDifference;
    const orderDifference = Number(left.sortOrder ?? 0) - Number(right.sortOrder ?? 0);
    return orderDifference || Number(left.id) - Number(right.id);
  });
}

export function getInvalidCompletionDays(habit, nextDays) {
  if (!Array.isArray(nextDays)) return ['invalid'];

  const invalid = new Set();
  const seen = new Set();
  for (const day of nextDays) {
    if (!isValidDateKey(day) || seen.has(day)) invalid.add(day);
    seen.add(day);
  }

  const existing = new Set(Array.isArray(habit.completeDays) ? habit.completeDays : []);
  const accepted = nextDays.filter(day => existing.has(day) && isValidDateKey(day));
  const additions = [...new Set(nextDays.filter(day => !existing.has(day) && isValidDateKey(day)))].sort();

  for (const day of additions) {
    const state = getHabitScheduleState(
      { ...habit, completeDays: accepted },
      { now: new Date(`${day}T12:00:00.000Z`), timeZone: 'UTC' },
    );
    if (!state.isActiveToday) invalid.add(day);
    else accepted.push(day);
  }

  return [...invalid];
}
