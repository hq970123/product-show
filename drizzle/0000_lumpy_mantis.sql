CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_url_unique` ON `products` (`url`);