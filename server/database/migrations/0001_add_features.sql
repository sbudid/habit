ALTER TABLE `habits` ADD `category` text NOT NULL DEFAULT 'umum';
ALTER TABLE `habits` ADD `target_days` integer NOT NULL DEFAULT 40;
ALTER TABLE `habits` ADD `sort_order` integer NOT NULL DEFAULT 0;
ALTER TABLE `habits` ADD `deleted_at` integer;
ALTER TABLE `users` ADD `lang` text NOT NULL DEFAULT 'id';
