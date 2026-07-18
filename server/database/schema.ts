import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#84cc16'),
  completeDays: text('complete_days', { mode: 'json' }).$type<string[]>().notNull().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  habitView: integer('habit_view', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const habitSchedules = sqliteTable('habit_schedules', {
  habitId: integer('habit_id')
    .primaryKey()
    .references(() => habits.id, { onDelete: 'cascade' }),
  scheduleType: text('schedule_type', { enum: ['daily', 'specific_days', 'times_per_week', 'interval_days'] })
    .notNull()
    .default('daily'),
  scheduleDays: text('schedule_days', { mode: 'json' }).$type<number[]>().notNull().default([]),
  weeklyTarget: integer('weekly_target').notNull().default(1),
  intervalDays: integer('interval_days').notNull().default(2),
  scheduleStartDate: text('schedule_start_date'),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  login: text('login').notNull().unique(),
  name: text('name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  userView: integer('user_view', { mode: 'boolean' }).notNull().default(false),
});
