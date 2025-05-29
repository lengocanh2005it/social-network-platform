/*
  Warnings:

  - You are about to drop the column `username` on the `UserProfiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserProfiles_username_key";

-- AlterTable
ALTER TABLE "UserProfiles" DROP COLUMN "username";
