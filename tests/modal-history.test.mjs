import assert from 'node:assert/strict';
import test from 'node:test';

import { nextModalHistoryStep } from '../app/utils/modalHistory.mjs';

test('nested programmatic closes unwind child then parent without stale entries', () => {
  const pending = ['parent', 'child'];

  const childStep = nextModalHistoryStep(['parent', 'child'], pending);
  assert.equal(childStep.shouldGoBack, true);
  assert.deepEqual(childStep.pending, ['parent']);

  const parentStep = nextModalHistoryStep(['parent'], childStep.pending);
  assert.equal(parentStep.shouldGoBack, true);
  assert.deepEqual(parentStep.pending, []);

  const baseStep = nextModalHistoryStep([], parentStep.pending);
  assert.equal(baseStep.shouldGoBack, false);
  assert.deepEqual(baseStep.pending, []);
});

test('a pending parent waits while an open child remains on top', () => {
  const step = nextModalHistoryStep(['parent', 'child'], ['parent']);
  assert.equal(step.shouldGoBack, false);
  assert.deepEqual(step.pending, ['parent']);
});

test('pending tokens no longer present in history are discarded', () => {
  const step = nextModalHistoryStep([], ['parent']);
  assert.equal(step.shouldGoBack, false);
  assert.deepEqual(step.pending, []);
});
