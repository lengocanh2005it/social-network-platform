/*
  Warnings:

  - Made the column `username` on table `UserProfiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserProfiles" ALTER COLUMN "username" SET NOT NULL;
