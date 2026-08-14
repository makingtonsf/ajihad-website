ALTER TABLE `users` ADD `motDePasseHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `jetonAcces` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `jetonExpiration` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `echecsConnexion` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `bloqueJusqua` timestamp;