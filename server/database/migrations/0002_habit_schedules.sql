-- Jadwal habit disimpan terpisah agar migration aman dan idempotent di D1/SQLite.
-- Habit lama tanpa row di tabel ini otomatis diperlakukan sebagai daily oleh aplikasi.
CREATE TABLE IF NOT EXISTS `habit_schedules` (
  `habit_id` integer PRIMARY KEY NOT NULL,
  `schedule_type` text DEFAULT 'daily' NOT NULL CHECK (`schedule_type` IN ('daily', 'specific_days', 'times_per_week', 'interval_days')),
  `schedule_days` text DEFAULT '[]' NOT NULL,
  `weekly_target` integer DEFAULT 1 NOT NULL CHECK (`weekly_target` BETWEEN 1 AND 7),
  `interval_days` integer DEFAULT 2 NOT NULL CHECK (`interval_days` BETWEEN 2 AND 365),
  `schedule_start_date` text,
  FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `habit_schedules_type_idx` ON `habit_schedules` (`schedule_type`);
