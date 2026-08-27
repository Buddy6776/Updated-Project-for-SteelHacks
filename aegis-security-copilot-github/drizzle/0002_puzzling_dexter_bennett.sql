CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accounts_email` ON `accounts` (`email`);--> statement-breakpoint
CREATE TABLE `notification_destinations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text NOT NULL,
	`channel` text NOT NULL,
	`destination` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`minimum_severity` text DEFAULT 'medium' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notification_destinations_user` ON `notification_destinations` (`user_id`);--> statement-breakpoint
CREATE TABLE `scans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`website_id` text,
	`url` text NOT NULL,
	`scan_type` text NOT NULL,
	`status` text NOT NULL,
	`finding_count` integer DEFAULT 0 NOT NULL,
	`score` integer,
	`started_at` text NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_scans_user_started` ON `scans` (`user_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `idx_scans_user_url` ON `scans` (`user_id`,`url`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user_expiry` ON `sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `vulnerabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`website_id` text,
	`url` text NOT NULL,
	`type` text NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`detected_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vulnerabilities_user_url_type` ON `vulnerabilities` (`user_id`,`url`,`type`);--> statement-breakpoint
CREATE INDEX `idx_vulnerabilities_user_updated` ON `vulnerabilities` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_vulnerabilities_user_status` ON `vulnerabilities` (`user_id`,`status`);--> statement-breakpoint
PRAGMA optimize;
