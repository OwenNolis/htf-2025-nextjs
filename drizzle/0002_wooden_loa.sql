PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_fish_sighting` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fishId` text NOT NULL,
	`latitude` text,
	`longitude` text,
	`sightingDate` integer NOT NULL,
	`spottedAt` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_fish_sighting`("id", "userId", "fishId", "latitude", "longitude", "sightingDate", "spottedAt", "createdAt") SELECT "id", "userId", "fishId", "latitude", "longitude", "sightingDate", "spottedAt", "createdAt" FROM `user_fish_sighting`;--> statement-breakpoint
DROP TABLE `user_fish_sighting`;--> statement-breakpoint
ALTER TABLE `__new_user_fish_sighting` RENAME TO `user_fish_sighting`;--> statement-breakpoint
PRAGMA foreign_keys=ON;