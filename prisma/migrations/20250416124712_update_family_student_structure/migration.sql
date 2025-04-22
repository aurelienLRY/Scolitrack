/*
  Warnings:

  - You are about to drop the column `address` on the `Family` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Family` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Family` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `legalGuardian` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Student` table. All the data in the column will be lost.
  - Added the required column `legalGuardians` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Family` DROP COLUMN `address`,
    DROP COLUMN `city`,
    DROP COLUMN `postalCode`;

-- AlterTable
ALTER TABLE `FamilyMember` ADD COLUMN `isMainAddress` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `address`,
    DROP COLUMN `city`,
    DROP COLUMN `legalGuardian`,
    DROP COLUMN `postalCode`,
    ADD COLUMN `hasSplitResidence` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `legalGuardians` VARCHAR(191) NOT NULL,
    ADD COLUMN `primaryAddressUserId` VARCHAR(191) NULL,
    ADD COLUMN `secondaryAddressUserId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Student_primaryAddressUserId_idx` ON `Student`(`primaryAddressUserId`);

-- CreateIndex
CREATE INDEX `Student_secondaryAddressUserId_idx` ON `Student`(`secondaryAddressUserId`);
