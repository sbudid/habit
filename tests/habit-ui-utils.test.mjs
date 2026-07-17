import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_HABIT_COLOR, HABIT_COLOR_PRESETS, normalizeHabitColor, visibleHistoryDays } from '../app/utils/habitUi.mjs';

test('normalizeHabitColor keeps valid hex colors and normalizes their case', () => {
  assert.equal(normalizeHabitColor('#3B82F6'), '#3b82f6');
});

test('normalizeHabitColor falls back for missing or invalid legacy values', () => {
  assert.equal(normalizeHabitColor(), DEFAULT_HABIT_COLOR);
  assert.equal(normalizeHabitColor('red'), DEFAULT_HABIT_COLOR);
  assert.equal(normalizeHabitColor('#12345'), DEFAULT_HABIT_COLOR);
});

test('the picker exposes ten distinct valid preset colors', () => {
  assert.equal(HABIT_COLOR_PRESETS.length, 10);
  assert.equal(new Set(HABIT_COLOR_PRESETS).size, 10);
  assert.ok(HABIT_COLOR_PRESETS.every(color => /^#[0-9a-f]{6}$/.test(color)));
});

test('visibleHistoryDays clamps responsive history between 7 and 14 blocks', () => {
  assert.equal(visibleHistoryDays(40), 7);
  assert.equal(visibleHistoryDays(94), 9);
  assert.equal(visibleHistoryDays(140), 14);
  assert.equal(visibleHistoryDays(400), 14);
});
