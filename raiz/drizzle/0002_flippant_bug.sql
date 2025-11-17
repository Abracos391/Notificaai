DROP INDEX `folder_idx` ON `documents`;--> statement-breakpoint
ALTER TABLE `documents` MODIFY COLUMN `folder` varchar(255);