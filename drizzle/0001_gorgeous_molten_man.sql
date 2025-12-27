CREATE TABLE `accountability_flags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`mp_id` int NOT NULL,
	`flag_type` varchar(100) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`detected_at` timestamp DEFAULT (now()),
	`resolved` boolean DEFAULT false,
	CONSTRAINT `accountability_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bill_sponsors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bill_id` int NOT NULL,
	`mp_id` int NOT NULL,
	`is_primary` boolean DEFAULT false,
	CONSTRAINT `bill_sponsors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bill_summaries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bill_id` int NOT NULL,
	`summary` text NOT NULL,
	`bullet_points` json NOT NULL,
	`generated_at` timestamp DEFAULT (now()),
	CONSTRAINT `bill_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bills` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`seimas_id` varchar(50) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`explanatory_notes` text,
	`status` varchar(50) NOT NULL,
	`category` varchar(100),
	`submitted_at` timestamp,
	`voted_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `bills_id` PRIMARY KEY(`id`),
	CONSTRAINT `bills_seimas_id_unique` UNIQUE(`seimas_id`)
);
--> statement-breakpoint
CREATE TABLE `committee_members` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`committee_id` int NOT NULL,
	`mp_id` int NOT NULL,
	`role` varchar(100),
	`joined_at` timestamp DEFAULT (now()),
	CONSTRAINT `committee_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `committees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `committees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mp_stats` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`mp_id` int NOT NULL,
	`voting_attendance` decimal(5,2) NOT NULL,
	`party_loyalty` decimal(5,2) NOT NULL,
	`bills_proposed` int DEFAULT 0,
	`bills_passed` int DEFAULT 0,
	`accountability_score` decimal(5,2) NOT NULL,
	`last_calculated` timestamp DEFAULT (now()),
	CONSTRAINT `mp_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`seimas_id` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`party` varchar(255) NOT NULL,
	`faction` varchar(255),
	`district` varchar(255),
	`district_number` int,
	`email` varchar(255),
	`phone` varchar(50),
	`photo_url` text,
	`biography` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `mps_id` PRIMARY KEY(`id`),
	CONSTRAINT `mps_seimas_id_unique` UNIQUE(`seimas_id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_answers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`mp_id` int NOT NULL,
	`answer` varchar(20) NOT NULL,
	CONSTRAINT `quiz_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bill_id` int,
	`question_text` text NOT NULL,
	`category` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_follows` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`mp_id` int,
	`bill_id` int,
	`topic` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_quiz_results` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`session_id` varchar(100) NOT NULL,
	`question_id` int NOT NULL,
	`user_answer` varchar(20) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_quiz_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bill_id` int NOT NULL,
	`mp_id` int NOT NULL,
	`vote_value` varchar(20) NOT NULL,
	`voted_at` timestamp DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accountability_flags` ADD CONSTRAINT `accountability_flags_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill_sponsors` ADD CONSTRAINT `bill_sponsors_bill_id_bills_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill_sponsors` ADD CONSTRAINT `bill_sponsors_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill_summaries` ADD CONSTRAINT `bill_summaries_bill_id_bills_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `committee_members` ADD CONSTRAINT `committee_members_committee_id_committees_id_fk` FOREIGN KEY (`committee_id`) REFERENCES `committees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `committee_members` ADD CONSTRAINT `committee_members_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mp_stats` ADD CONSTRAINT `mp_stats_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_question_id_quiz_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_bill_id_bills_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_bill_id_bills_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_quiz_results` ADD CONSTRAINT `user_quiz_results_question_id_quiz_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_bill_id_bills_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_mp_id_mps_id_fk` FOREIGN KEY (`mp_id`) REFERENCES `mps`(`id`) ON DELETE no action ON UPDATE no action;