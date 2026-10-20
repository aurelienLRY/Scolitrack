-- AlterTable
ALTER TABLE `EnrollmentSignature` ADD COLUMN `batchToken` VARCHAR(191) NULL;

-- AlterEnum
ALTER TABLE `EnrollmentSignature` MODIFY `status` ENUM('PENDING', 'SIGNED', 'EXPIRED', 'DECLINED') NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX `EnrollmentSignature_batchToken_idx` ON `EnrollmentSignature`(`batchToken`);
