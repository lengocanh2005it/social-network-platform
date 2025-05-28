/*
  Warnings:

  - You are about to drop the `PostShareContents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostShareHashTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostShares` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostShareContents" DROP CONSTRAINT "PostShareContents_post_share_id_fkey";

-- DropForeignKey
ALTER TABLE "PostShareHashTags" DROP CONSTRAINT "PostShareHashTags_hashtag_id_fkey";

-- DropForeignKey
ALTER TABLE "PostShareHashTags" DROP CONSTRAINT "PostShareHashTags_post_share_id_fkey";

-- DropForeignKey
ALTER TABLE "PostShares" DROP CONSTRAINT "PostShares_post_id_fkey";

-- DropForeignKey
ALTER TABLE "PostShares" DROP CONSTRAINT "PostShares_user_id_fkey";

-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "parent_post_id" UUID;

-- DropTable
DROP TABLE "PostShareContents";

-- DropTable
DROP TABLE "PostShareHashTags";

-- DropTable
DROP TABLE "PostShares";

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_parent_post_id_fkey" FOREIGN KEY ("parent_post_id") REFERENCES "Posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
