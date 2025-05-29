/*
  Warnings:

  - You are about to drop the `Followers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `UserProfiles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Followers" DROP CONSTRAINT "Followers_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "Followers" DROP CONSTRAINT "Followers_user_id_fkey";

-- AlterTable
ALTER TABLE "UserProfiles" ADD COLUMN     "username" VARCHAR(255);

-- DropTable
DROP TABLE "Followers";

-- CreateIndex
CREATE UNIQUE INDEX "UserProfiles_username_key" ON "UserProfiles"("username");
