import test from 'node:test';
import assert from 'node:assert/strict';

import { buildReorderPlan, canReorderHabit, moveHabitIds, reorderHabitIds } from '../app/utils/habitReorder.mjs';

test('reorder plan accepts the exact owned habit set and assigns stable positions', () => {
  assert.deepEqual(buildReorderPlan([10, 20, 30], [30, 10, 20]), [
    { id: 30, sortOrder: 0 },
    { id: 10, sortOrder: 1 },
    { id: 20, sortOrder: 2 },
  ]);
});

test('reorder plan rejects missing, foreign, or duplicate habit ids', () => {
  assert.throws(() => buildReorderPlan([10, 20], [10]), /seluruh habit/i);
  assert.throws(() => buildReorderPlan([10, 20], [10, 30]), /milik user/i);
  assert.throws(() => buildReorderPlan([10, 20], [10, 10]), /duplikat/i);
});

test('fallback move changes one position and respects list boundaries', () => {
  assert.deepEqual(moveHabitIds([10, 20, 30], 20, -1), [20, 10, 30]);
  assert.deepEqual(moveHabitIds([10, 20, 30], 20, 1), [10, 30, 20]);
  assert.deepEqual(moveHabitIds([10, 20, 30], 10, -1), [10, 20, 30]);
  assert.deepEqual(moveHabitIds([10, 20, 30], 30, 1), [10, 20, 30]);
});

test('drag reorder moves source id onto target position without losing ids', () => {
  assert.deepEqual(reorderHabitIds([10, 20, 30, 40], 10, 30), [20, 30, 10, 40]);
  assert.deepEqual(reorderHabitIds([10, 20, 30, 40], 40, 20), [10, 40, 20, 30]);
});

test('reorder only allows movement inside the same active or inactive group', () => {
  const groups = new Map([[10, true], [20, true], [30, false]]);
  assert.equal(canReorderHabit(groups, 10, 20), true);
  assert.equal(canReorderHabit(groups, 20, 30), false);
});
