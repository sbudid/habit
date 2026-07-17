export const DEFAULT_HABIT_COLOR = '#84cc16';

export const HABIT_COLOR_PRESETS = Object.freeze(['#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#64748b']);

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function normalizeHabitColor(color) {
  return typeof color === 'string' && HEX_COLOR.test(color) ? color.toLowerCase() : DEFAULT_HABIT_COLOR;
}

export function visibleHistoryDays(width) {
  const blocksThatFit = Math.floor(Math.max(0, width) / 10);
  return Math.min(14, Math.max(7, blocksThatFit));
}
