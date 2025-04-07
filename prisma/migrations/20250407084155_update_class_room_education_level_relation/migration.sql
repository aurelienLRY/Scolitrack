/*
  Warnings:

  - You are about to drop the column `level` on the `ClassRoom` table. All the data in the column will be lost.
  - Made the column `capacity` on table `ClassRoom` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ClassRoom` DROP FOREIGN KEY `ClassRoom_establishmentId_fkey`;

-- AlterTable
ALTER TABLE `ClassRoom` DROP COLUMN `level`,
    MODIFY `capacity` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `EducationLevel` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `establishmentId` VARCHAR(191) NOT NULL,
    `establishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EducationLevel_establishmentId_idx`(`establishmentId`),
    UNIQUE INDEX `EducationLevel_name_establishmentId_key`(`name`, `establishmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassRoomEducationLevel` (
    `classRoomId` VARCHAR(191) NOT NULL,
    `educationLevelId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ClassRoomEducationLevel_classRoomId_idx`(`classRoomId`),
    INDEX `ClassRoomEducationLevel_educationLevelId_idx`(`educationLevelId`),
    PRIMARY KEY (`classRoomId`, `educationLevelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClassRoom` ADD CONSTRAINT `ClassRoom_establishmentId_fkey` FOREIGN KEY (`establishmentId`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationLevel` ADD CONSTRAINT `EducationLevel_establishmentId_fkey` FOREIGN KEY (`establishmentId`) REFERENCES `Establishment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassRoomEducationLevel` ADD CONSTRAINT `ClassRoomEducationLevel_classRoomId_fkey` FOREIGN KEY (`classRoomId`) REFERENCES `ClassRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassRoomEducationLevel` ADD CONSTRAINT `ClassRoomEducationLevel_educationLevelId_fkey` FOREIGN KEY (`educationLevelId`) REFERENCES `EducationLevel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
