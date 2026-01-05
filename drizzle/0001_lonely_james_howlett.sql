CREATE TABLE `mp_assistants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mp_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255),
	`phone` varchar(50),
	`email` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mp_assistants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mp_trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mp_id` int NOT NULL,
	`destination` varchar(255) NOT NULL,
	`purpose` text,
	`start_date` timestamp,
	`end_date` timestamp,
	`cost` decimal(10,2),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `mp_trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mp_assistants` ADD CONSTRAINT `mp_assistants_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mp_trips` ADD CONSTRAINT `mp_trips_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;