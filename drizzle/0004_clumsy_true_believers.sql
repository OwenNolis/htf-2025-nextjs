CREATE TABLE `user_friend` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`friendUserId` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`friendUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
