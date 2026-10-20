-- AlterTable
ALTER TABLE `EnrollmentFile` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `EnrollmentFile_deletedAt_idx` ON `EnrollmentFile`(`deletedAt`);
