import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull().default('umum'),
  completeDays: text('complete_days', { mode: 'json' }).$type<string[]>().notNull().default([]),
  targetDays: integer('target_days').notNull().default(40),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  habitView: integer('habit_view', { mode: 'boolean' }).notNull().default(false),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  login: text('login').notNull().unique(),
  name: text('name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  userView: integer('user_view', { mode: 'boolean' }).notNull().default(false),
  lang: text('lang').notNull().default('id'),
});
