-- MySQL Database Schema for Clifford University Alumni Association (CUAA)
-- Optimized for MySQL 8.0+ / MariaDB 10.5+

CREATE DATABASE IF NOT EXISTS `cuaa_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cuaa_db`;

-- Disable foreign key checks for table creation/dropping
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. MEDIA TABLE (Cloudinary assets)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `media` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `cloudinaryPublicId` VARCHAR(255) NOT NULL UNIQUE,
  `secureUrl` TEXT NOT NULL,
  `resourceType` VARCHAR(50) NOT NULL DEFAULT 'image',
  `format` VARCHAR(20) DEFAULT NULL,
  `width` INT DEFAULT NULL,
  `height` INT DEFAULT NULL,
  `bytes` INT DEFAULT NULL,
  `folder` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_media_folder` (`folder`),
  INDEX `idx_media_public_id` (`cloudinaryPublicId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. GRADUATING SETS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `graduating_sets` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `setName` VARCHAR(100) NOT NULL UNIQUE,
  `graduationYear` INT NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_grad_set_year` (`graduationYear`),
  INDEX `idx_grad_set_name` (`setName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. FACULTIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faculties` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `code` VARCHAR(50) UNIQUE DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_faculties_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. DEPARTMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `code` VARCHAR(50) UNIQUE DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_departments_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. LOCATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `locations` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `state` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `isDiaspora` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_state_city` (`state`, `city`),
  INDEX `idx_locations_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. OFFICIAL ALUMNI DIRECTORY (ROSTER)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `official_alumni_directory` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `matricNumber` VARCHAR(100) NOT NULL UNIQUE,
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `graduatingSetId` VARCHAR(36) NOT NULL,
  `facultyId` VARCHAR(36) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `isRegistered` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_official_matric` (`matricNumber`),
  INDEX `idx_official_registered` (`isRegistered`),
  FOREIGN KEY (`graduatingSetId`) REFERENCES `graduating_sets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`facultyId`) REFERENCES `faculties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. MEMBERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `members` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `matricNumber` VARCHAR(100) UNIQUE DEFAULT NULL,
  `memberType` ENUM('ALUMNI', 'ASSOCIATE') NOT NULL DEFAULT 'ALUMNI',
  `role` ENUM('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'EXCO_ADMIN', 'FINANCE_ADMIN', 'WELFARE_ADMIN', 'CONTENT_ADMIN', 'MODERATOR') NOT NULL DEFAULT 'MEMBER',
  `verificationStatus` ENUM('PENDING', 'VERIFIED', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'VERIFIED',
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `graduatingSetId` VARCHAR(36) DEFAULT NULL,
  `facultyId` VARCHAR(36) DEFAULT NULL,
  `department` VARCHAR(150) DEFAULT NULL,
  `locationId` VARCHAR(36) DEFAULT NULL,
  `diasporaCountry` VARCHAR(100) DEFAULT NULL,
  `diasporaCity` VARCHAR(100) DEFAULT NULL,
  `profession` VARCHAR(150) DEFAULT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `skills` JSON DEFAULT NULL,
  `profilePhotoMediaId` VARCHAR(36) DEFAULT NULL,
  `privacySettings` JSON DEFAULT NULL,
  `isAlumniOfWeek` TINYINT(1) NOT NULL DEFAULT 0,
  `alumniOfWeekBio` TEXT DEFAULT NULL,
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME DEFAULT NULL,
  INDEX `idx_members_email` (`email`),
  INDEX `idx_members_matric` (`matricNumber`),
  INDEX `idx_members_status` (`verificationStatus`),
  INDEX `idx_members_gradset` (`graduatingSetId`),
  INDEX `idx_members_faculty` (`facultyId`),
  INDEX `idx_members_alumni_week` (`isAlumniOfWeek`),
  INDEX `idx_members_featured` (`isFeatured`),
  FOREIGN KEY (`graduatingSetId`) REFERENCES `graduating_sets`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`facultyId`) REFERENCES `faculties`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`profilePhotoMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. REFRESH TOKENS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(36) NOT NULL,
  `hashedToken` VARCHAR(255) NOT NULL UNIQUE,
  `deviceInfo` TEXT DEFAULT NULL,
  `expiresAt` DATETIME NOT NULL,
  `isRevoked` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ref_token_member` (`memberId`),
  INDEX `idx_ref_token_hash` (`hashedToken`),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. EVENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `bannerMediaId` VARCHAR(36) DEFAULT NULL,
  `eventDate` DATETIME NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `isVirtual` TINYINT(1) NOT NULL DEFAULT 0,
  `meetingLink` TEXT DEFAULT NULL,
  `organizer` VARCHAR(150) NOT NULL DEFAULT 'CUAA',
  `category` VARCHAR(100) NOT NULL DEFAULT 'General',
  `capacity` INT DEFAULT NULL,
  `createdById` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_events_date` (`eventDate`),
  INDEX `idx_events_slug` (`slug`),
  FOREIGN KEY (`bannerMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. EVENT REGISTRATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `eventId` VARCHAR(36) NOT NULL,
  `memberId` VARCHAR(36) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
  `registeredAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_event_member` (`eventId`, `memberId`),
  FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. NEWS & ANNOUNCEMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_announcements` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` LONGTEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'OFFICIAL_ANNOUNCEMENT',
  `bannerMediaId` VARCHAR(36) DEFAULT NULL,
  `isPublished` TINYINT(1) NOT NULL DEFAULT 1,
  `publishedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_news_category` (`category`),
  INDEX `idx_news_published` (`publishedAt`),
  FOREIGN KEY (`bannerMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. GALLERY ALBUMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery_albums` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'ALUMNI_EVENT',
  `graduatingSetId` VARCHAR(36) DEFAULT NULL,
  `year` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gallery_category` (`category`),
  INDEX `idx_gallery_gradset` (`graduatingSetId`),
  FOREIGN KEY (`graduatingSetId`) REFERENCES `graduating_sets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. GALLERY PHOTOS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery_photos` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `albumId` VARCHAR(36) NOT NULL,
  `mediaId` VARCHAR(36) NOT NULL,
  `caption` TEXT DEFAULT NULL,
  `uploadedById` VARCHAR(36) NOT NULL,
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_gallery_album` (`albumId`),
  INDEX `idx_gallery_featured` (`isFeatured`),
  FOREIGN KEY (`albumId`) REFERENCES `gallery_albums`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploadedById`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. BUSINESS LISTINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `business_listings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(36) NOT NULL,
  `businessName` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `industry` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `services` TEXT NOT NULL,
  `logoMediaId` VARCHAR(36) DEFAULT NULL,
  `bannerMediaId` VARCHAR(36) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `stateCity` VARCHAR(150) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejectionReason` TEXT DEFAULT NULL,
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_business_status` (`status`),
  INDEX `idx_business_category` (`category`),
  INDEX `idx_business_member` (`memberId`),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`logoMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`bannerMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. DUES ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dues_items` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('ANNUAL_DUES', 'SPECIAL_LEVY', 'PROJECT_LEVY') NOT NULL DEFAULT 'ANNUAL_DUES',
  `amount` DOUBLE NOT NULL,
  `academicYear` VARCHAR(50) DEFAULT NULL,
  `isRequired` TINYINT(1) NOT NULL DEFAULT 1,
  `description` TEXT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. DONATION CAMPAIGNS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `donation_campaigns` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `targetAmount` DOUBLE NOT NULL,
  `raisedAmount` DOUBLE NOT NULL DEFAULT 0,
  `startDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endDate` DATETIME DEFAULT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. PAYMENT RECORDS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_records` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(36) NOT NULL,
  `duesItemId` VARCHAR(36) DEFAULT NULL,
  `donationCampaignId` VARCHAR(36) DEFAULT NULL,
  `amount` DOUBLE NOT NULL,
  `paymentMethod` ENUM('PAYSTACK', 'FLUTTERWAVE', 'BANK_TRANSFER', 'CASH', 'KORAPAY') NOT NULL DEFAULT 'KORAPAY',
  `transactionRef` VARCHAR(191) NOT NULL UNIQUE,
  `receiptNumber` VARCHAR(191) NOT NULL UNIQUE,
  `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `proofMediaId` VARCHAR(36) DEFAULT NULL,
  `paidAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_payment_member` (`memberId`),
  INDEX `idx_payment_status` (`status`),
  INDEX `idx_payment_txref` (`transactionRef`),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`duesItemId`) REFERENCES `dues_items`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`donationCampaignId`) REFERENCES `donation_campaigns`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`proofMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 18. WELFARE REQUESTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `welfare_requests` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(36) NOT NULL,
  `category` ENUM('EMERGENCY', 'BEREAVEMENT', 'ILLNESS', 'FINANCIAL_ASSISTANCE', 'DISASTER_RELIEF', 'OTHER') NOT NULL DEFAULT 'OTHER',
  `urgency` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('NEW', 'PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  `description` TEXT NOT NULL,
  `assignedOfficerId` VARCHAR(36) DEFAULT NULL,
  `internalNotes` TEXT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_welfare_member` (`memberId`),
  INDEX `idx_welfare_status` (`status`),
  INDEX `idx_welfare_urgency` (`urgency`),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assignedOfficerId`) REFERENCES `members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 19. DISCUSSION POSTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `discussion_posts` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `authorId` VARCHAR(36) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'General',
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `mediaId` VARCHAR(36) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_posts_category` (`category`),
  INDEX `idx_posts_author` (`authorId`),
  FOREIGN KEY (`authorId`) REFERENCES `members`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 20. DISCUSSION COMMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `discussion_comments` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `postId` VARCHAR(36) NOT NULL,
  `authorId` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comments_post` (`postId`),
  FOREIGN KEY (`postId`) REFERENCES `discussion_posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`authorId`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 21. CHAT MESSAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `senderId` VARCHAR(36) NOT NULL,
  `receiverId` VARCHAR(36) NOT NULL,
  `messageText` TEXT NOT NULL,
  `isRead` TINYINT(1) NOT NULL DEFAULT 0,
  `sentAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_chat_pair` (`senderId`, `receiverId`),
  FOREIGN KEY (`senderId`) REFERENCES `members`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiverId`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 22. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `memberId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  `isRead` TINYINT(1) NOT NULL DEFAULT 0,
  `linkUrl` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_member` (`memberId`, `isRead`),
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 23. LEADERSHIP PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leadership_profiles` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(150) NOT NULL,
  `biography` TEXT NOT NULL,
  `photoMediaId` VARCHAR(36) DEFAULT NULL,
  `photoUrl` TEXT DEFAULT NULL,
  `memberId` VARCHAR(36) DEFAULT NULL,
  `termStart` INT NOT NULL,
  `termEnd` INT DEFAULT NULL,
  `isCurrent` TINYINT(1) NOT NULL DEFAULT 1,
  `orderIndex` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_leadership_current` (`isCurrent`, `orderIndex`),
  FOREIGN KEY (`photoMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 24. IMPACT STATS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `impact_stats` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `activeMembers` INT NOT NULL DEFAULT 0,
  `totalDonations` DOUBLE NOT NULL DEFAULT 0,
  `projectsFunded` INT NOT NULL DEFAULT 0,
  `countriesCount` INT NOT NULL DEFAULT 0,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- -----------------------------------------------------------------------------

-- Seed Default Admin
INSERT IGNORE INTO `members` (`id`, `email`, `passwordHash`, `firstName`, `lastName`, `role`, `verificationStatus`, `memberType`)
VALUES (
  'admin-default-uuid',
  'admin@cuaa.org',
  '$2y$10$8.4k1L6k.4fOqJ2/l1E.xO1bM.U.Z5.Xm6b8z1z1z1z1z1z1z1z1', -- Password: AdminPassword123!
  'System',
  'Admin',
  'SUPER_ADMIN',
  'VERIFIED',
  'ALUMNI'
);

-- Seed Graduating Sets
INSERT IGNORE INTO `graduating_sets` (`id`, `setName`, `graduationYear`, `description`) VALUES
('set-2020', 'Alpha Set', 2020, 'First Graduating Set of Clifford University'),
('set-2021', 'Pioneer Set', 2021, 'Second Graduating Class'),
('set-2022', 'Apex Set', 2022, 'Third Graduating Class'),
('set-2023', 'Excel Set', 2023, 'Fourth Graduating Class'),
('set-2024', 'Summit Set', 2024, 'Fifth Graduating Class'),
('set-2025', 'Legacy Set', 2025, 'Sixth Graduating Class');

-- Seed Faculties
INSERT IGNORE INTO `faculties` (`id`, `name`, `code`) VALUES
('fac-1', 'Faculty of Science', 'FSC'),
('fac-2', 'Faculty of Humanities', 'FHM'),
('fac-3', 'Faculty of Social and Management Sciences', 'SMS'),
('fac-4', 'Faculty of Law', 'FLW'),
('fac-5', 'OTHERS', 'OTH');

-- Seed Departments
INSERT IGNORE INTO `departments` (`id`, `name`, `code`) VALUES
('dept-1', 'Computer Science', 'CSC'),
('dept-2', 'Accounting', 'ACC'),
('dept-3', 'Business Administration', 'BUS'),
('dept-4', 'Mass Communication', 'MAC'),
('dept-5', 'Biochemistry', 'BCH'),
('dept-6', 'Microbiology', 'MCB'),
('dept-7', 'Economics', 'ECO'),
('dept-8', 'Law', 'LAW');

-- Seed Impact Stats
INSERT IGNORE INTO `impact_stats` (`id`, `activeMembers`, `totalDonations`, `projectsFunded`, `countriesCount`) VALUES
('default-impact-stats', 1250, 45000000, 18, 12);

-- Seed Annual Dues
INSERT IGNORE INTO `dues_items` (`id`, `title`, `type`, `amount`, `academicYear`, `isRequired`, `description`) VALUES
('annual-dues-2025', '2025 Annual Alumni Membership Dues', 'ANNUAL_DUES', 10000, '2024/2025', 1, 'Standard annual dues for active alumni association membership.');
