CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`website_id` text NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_alerts_website_status` ON `alerts` (`website_id`,`status`);--> statement-breakpoint
CREATE TABLE `websites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hostname` text NOT NULL,
	`verification_token` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`monitoring_enabled` integer DEFAULT false NOT NULL,
	`notify_email` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`last_checked_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_websites_user_hostname` ON `websites` (`user_id`,`hostname`);--> statement-breakpoint
CREATE INDEX `idx_websites_user_id` ON `websites` (`user_id`);
--> statement-breakpoint
PRAGMA optimize;
