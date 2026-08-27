CREATE TABLE `endpoint_events` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint_id` text NOT NULL,
	`severity` text NOT NULL,
	`event_type` text NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`observed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_endpoint_events_endpoint_status` ON `endpoint_events` (`endpoint_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_endpoint_events_observed_at` ON `endpoint_events` (`observed_at`);--> statement-breakpoint
CREATE TABLE `endpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`hostname` text,
	`platform` text,
	`os_version` text,
	`agent_version` text,
	`token_hash` text NOT NULL,
	`firewall_enabled` integer,
	`disk_encryption` integer,
	`auto_updates` integer,
	`last_seen_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_endpoints_user_id` ON `endpoints` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_endpoints_token_hash` ON `endpoints` (`token_hash`);--> statement-breakpoint
PRAGMA optimize;
