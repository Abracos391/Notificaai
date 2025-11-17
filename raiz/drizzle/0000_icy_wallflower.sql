CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentType` varchar(100) NOT NULL,
	`granted` boolean NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`grantedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paymentId` int,
	`creditsAmount` int NOT NULL,
	`totalAmount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` text NOT NULL,
	`description` text,
	`category` enum('petition','contract','power_of_attorney','notification','other') NOT NULL,
	`content` text NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` enum('petition','contract','power_of_attorney','notification','other') NOT NULL,
	`folder` varchar(255),
	`version` int NOT NULL DEFAULT 1,
	`parentDocumentId` int,
	`pdfUrl` text,
	`docxUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` int NOT NULL,
	`filename` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificationAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipientName` text NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientPhone` varchar(20),
	`recipientAddress` text,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`certificationLevel` enum('simple','advanced','qualified') NOT NULL DEFAULT 'simple',
	`documentHash` varchar(128),
	`timestampToken` text,
	`timestampUrl` text,
	`certificateUrl` text,
	`status` enum('draft','scheduled','sending','sent','read','failed') NOT NULL DEFAULT 'draft',
	`scheduledFor` timestamp,
	`sentAt` timestamp,
	`readAt` timestamp,
	`failureReason` text,
	`readIp` varchar(45),
	`readUserAgent` text,
	`readLocation` text,
	`externalServiceId` varchar(255),
	`externalServiceName` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`asaasPaymentId` varchar(255) NOT NULL,
	`asaasInvoiceUrl` text,
	`amount` int NOT NULL,
	`paymentMethod` enum('credit_card','pix','boleto') NOT NULL,
	`status` enum('pending','confirmed','received','overdue','refunded','canceled') NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`paymentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`asaasCustomerId` varchar(255),
	`asaasSubscriptionId` varchar(255),
	`plan` enum('basic','professional','enterprise') NOT NULL,
	`status` enum('active','canceled','suspended','pending') NOT NULL,
	`amount` int NOT NULL,
	`billingCycle` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`startDate` timestamp NOT NULL,
	`nextBillingDate` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `systemAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('scheduled_notification','payment_due','payment_failed','subscription_expiring','credit_low') NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','advogado','assistente') NOT NULL DEFAULT 'user',
	`oabNumber` varchar(20),
	`oabState` varchar(2),
	`lawFirm` text,
	`cpf` varchar(14),
	`phone` varchar(20),
	`subscriptionPlan` enum('free','basic','professional','enterprise') NOT NULL DEFAULT 'free',
	`subscriptionStatus` enum('active','canceled','suspended','trial') NOT NULL DEFAULT 'trial',
	`subscriptionExpiresAt` timestamp,
	`credits` int NOT NULL DEFAULT 0,
	`mfaEnabled` boolean NOT NULL DEFAULT false,
	`mfaSecret` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `auditLogs` (`action`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `auditLogs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `consents` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `consents` (`consentType`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `creditPurchases` (`userId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `documentTemplates` (`userId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `documentTemplates` (`category`);--> statement-breakpoint
CREATE INDEX `public_idx` ON `documentTemplates` (`isPublic`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `documents` (`userId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE INDEX `notification_idx` ON `notificationAttachments` (`notificationId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `notifications` (`status`);--> statement-breakpoint
CREATE INDEX `scheduled_idx` ON `notifications` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `recipient_email_idx` ON `notifications` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `payments` (`userId`);--> statement-breakpoint
CREATE INDEX `subscription_idx` ON `payments` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `asaas_payment_idx` ON `payments` (`asaasPaymentId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `asaas_subscription_idx` ON `subscriptions` (`asaasSubscriptionId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `systemAlerts` (`userId`);--> statement-breakpoint
CREATE INDEX `is_read_idx` ON `systemAlerts` (`isRead`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `oab_idx` ON `users` (`oabNumber`);