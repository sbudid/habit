import test from 'node:test';
import assert from 'node:assert/strict';

import { getHabitScheduleState, getInvalidCompletionDays, isValidDateKey, normalizeHabitSchedule, sortHabitsForToday } from '../app/utils/habitSchedule.mjs';

const baseHabit = {
  id: 1,
  title: 'Habit',
  completeDays: [],
  createdAt: '2026-07-01T00:00:00.000Z',
  sortOrder: 0,
};

test('legacy habit without schedule is treated as daily', () => {
  const schedule = normalizeHabitSchedule(baseHabit);
  const state = getHabitScheduleState(baseHabit, {
    now: new Date('2026-07-15T03:00:00.000Z'),
    timeZone: 'Asia/Jakarta',
  });

  assert.equal(schedule.scheduleType, 'daily');
  assert.equal(state.isActiveToday, true);
  assert.equal(state.todayKey, '2026-07-15');
});

test('specific days use ISO weekdays 1 Monday through 7 Sunday', () => {
  const habit = { ...baseHabit, scheduleType: 'specific_days', scheduleDays: [1, 3, 5] };
  const tuesday = getHabitScheduleState(habit, {
    now: new Date('2026-07-14T03:00:00.000Z'),
    timeZone: 'Asia/Jakarta',
  });
  const wednesday = getHabitScheduleState(habit, {
    now: new Date('2026-07-15T03:00:00.000Z'),
    timeZone: 'Asia/Jakarta',
  });

  assert.equal(tuesday.isActiveToday, false);
  assert.equal(tuesday.nextDate, '2026-07-15');
  assert.equal(wednesday.isActiveToday, true);
});

test('weekly target stays active until target is reached and reports weekly progress', () => {
  const habit = {
    ...baseHabit,
    scheduleType: 'times_per_week',
    weeklyTarget: 3,
    completeDays: ['2026-07-13', '2026-07-14'],
  };
  const options = { now: new Date('2026-07-15T03:00:00.000Z'), timeZone: 'Asia/Jakarta' };
  const open = getHabitScheduleState(habit, options);
  const reached = getHabitScheduleState({ ...habit, completeDays: [...habit.completeDays, '2026-07-15'] }, options);

  assert.equal(open.isActiveToday, true);
  assert.equal(open.weeklyProgress, 2);
  assert.equal(open.label, '2/3 minggu ini');
  assert.equal(reached.isActiveToday, false);
  assert.equal(reached.weeklyProgress, 3);
  assert.equal(reached.nextDate, '2026-07-20');
});

test('interval schedule is anchored to schedule start date', () => {
  const habit = {
    ...baseHabit,
    scheduleType: 'interval_days',
    intervalDays: 3,
    scheduleStartDate: '2026-07-10',
  };
  const due = getHabitScheduleState(habit, {
    now: new Date('2026-07-16T03:00:00.000Z'),
    timeZone: 'Asia/Jakarta',
  });
  const waiting = getHabitScheduleState(habit, {
    now: new Date('2026-07-15T03:00:00.000Z'),
    timeZone: 'Asia/Jakarta',
  });

  assert.equal(due.isActiveToday, true);
  assert.equal(waiting.isActiveToday, false);
  assert.equal(waiting.nextDate, '2026-07-16');
});

test('schedule day follows the user timezone around UTC midnight', () => {
  const habit = { ...baseHabit, scheduleType: 'specific_days', scheduleDays: [1] };
  const now = new Date('2026-07-19T17:30:00.000Z');

  assert.equal(getHabitScheduleState(habit, { now, timeZone: 'Asia/Jakarta' }).isActiveToday, true);
  assert.equal(getHabitScheduleState(habit, { now, timeZone: 'America/Los_Angeles' }).isActiveToday, false);
});

test('today-active habits sort before inactive habits and preserve sort order inside each group', () => {
  const habits = [
    { ...baseHabit, id: 1, sortOrder: 20, scheduleType: 'specific_days', scheduleDays: [2] },
    { ...baseHabit, id: 2, sortOrder: 30, scheduleType: 'daily' },
    { ...baseHabit, id: 3, sortOrder: 10, scheduleType: 'daily' },
  ];

  const sorted = sortHabitsForToday(habits, {
    now: new Date('2026-07-15T03:00:00.000Z'),
    timeZone: 'Asia/Jakarta',
  });

  assert.deepEqual(sorted.map(habit => habit.id), [3, 2, 1]);
});

test('date keys reject impossible calendar dates', () => {
  assert.equal(isValidDateKey('2026-02-28'), true);
  assert.equal(isValidDateKey('2026-02-30'), false);
  assert.equal(isValidDateKey('2026-99-99'), false);
});

test('new completion dates must be unique and active for the habit schedule', () => {
  const specific = { ...baseHabit, scheduleType: 'specific_days', scheduleDays: [1] };
  assert.deepEqual(getInvalidCompletionDays(specific, ['2026-07-13']), []);
  assert.deepEqual(getInvalidCompletionDays(specific, ['2026-07-14']), ['2026-07-14']);
  assert.deepEqual(getInvalidCompletionDays(specific, ['2026-07-13', '2026-07-13']), ['2026-07-13']);
});

test('weekly completion cannot exceed its target through a direct API payload', () => {
  const weekly = { ...baseHabit, scheduleType: 'times_per_week', weeklyTarget: 1, completeDays: ['2026-07-13'] };
  assert.deepEqual(getInvalidCompletionDays(weekly, ['2026-07-13', '2026-07-14']), ['2026-07-14']);
});
