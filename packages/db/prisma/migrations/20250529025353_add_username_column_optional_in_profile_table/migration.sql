/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `UserProfiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserProfiles" ADD COLUMN     "username" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfiles_username_key" ON "UserProfiles"("username");
