-- CreateTable
CREATE TABLE `EnrollmentCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,

    INDEX `EnrollmentCampaign_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnrollmentFile` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `familyId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'NEED_INFO', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `token` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewerId` VARCHAR(191) NULL,
    `decisionNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EnrollmentFile_token_key`(`token`),
    INDEX `EnrollmentFile_campaignId_idx`(`campaignId`),
    INDEX `EnrollmentFile_familyId_idx`(`familyId`),
    INDEX `EnrollmentFile_reviewerId_idx`(`reviewerId`),
    INDEX `EnrollmentFile_email_idx`(`email`),
    INDEX `EnrollmentFile_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnrollmentStudent` (
    `fileId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EnrollmentStudent_fileId_idx`(`fileId`),
    INDEX `EnrollmentStudent_studentId_idx`(`studentId`),
    PRIMARY KEY (`fileId`, `studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnrollmentHistory` (
    `id` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `oldStatus` ENUM('DRAFT', 'SUBMITTED', 'NEED_INFO', 'APPROVED', 'REJECTED') NOT NULL,
    `newStatus` ENUM('DRAFT', 'SUBMITTED', 'NEED_INFO', 'APPROVED', 'REJECTED') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EnrollmentHistory_fileId_idx`(`fileId`),
    INDEX `EnrollmentHistory_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EnrollmentCampaign` ADD CONSTRAINT `EnrollmentCampaign_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentFile` ADD CONSTRAINT `EnrollmentFile_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `EnrollmentCampaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentFile` ADD CONSTRAINT `EnrollmentFile_familyId_fkey` FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentFile` ADD CONSTRAINT `EnrollmentFile_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentStudent` ADD CONSTRAINT `EnrollmentStudent_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `EnrollmentFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentStudent` ADD CONSTRAINT `EnrollmentStudent_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentHistory` ADD CONSTRAINT `EnrollmentHistory_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `EnrollmentFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentHistory` ADD CONSTRAINT `EnrollmentHistory_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
