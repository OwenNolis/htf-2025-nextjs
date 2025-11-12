CREATE TABLE `user_achievement` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`achievementId` text NOT NULL,
	`progress` integer DEFAULT 0,
	`unlockedAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_fish_image` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fishId` text NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` text,
	`takenAt` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
