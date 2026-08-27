ALTER TABLE `accounts` ADD `terms_accepted_at` text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `terms_version` text DEFAULT '2026-08-27' NOT NULL;--> statement-breakpoint
PRAGMA optimize;
