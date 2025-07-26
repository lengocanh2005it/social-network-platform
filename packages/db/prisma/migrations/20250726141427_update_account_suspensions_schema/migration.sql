/*
  Warnings:

  - You are about to drop the column `expired_at` on the `AccountSuspensions` table. All the data in the column will be lost.
  - You are about to drop the column `is_permanent` on the `AccountSuspensions` table. All the data in the column will be lost.
  - You are about to drop the column `un_uspended_at` on the `AccountSuspensions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccountSuspensions" DROP COLUMN "expired_at",
DROP COLUMN "is_permanent",
DROP COLUMN "un_uspended_at",
ADD COLUMN     "unsuspended_at" TIMESTAMP(3);
