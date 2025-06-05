/*
  Warnings:

  - You are about to drop the column `created_by` on the `Conversations` table. All the data in the column will be lost.
  - You are about to drop the column `group_avatar_url` on the `Conversations` table. All the data in the column will be lost.
  - You are about to drop the column `group_name` on the `Conversations` table. All the data in the column will be lost.
  - You are about to drop the column `is_group` on the `Conversations` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Conversations` table. All the data in the column will be lost.
  - You are about to drop the `ConversationParticipants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupJoinRequests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageReactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoryReactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_1_id,user_2_id]` on the table `Conversations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_1_id` to the `Conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_2_id` to the `Conversations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConversationParticipants" DROP CONSTRAINT "ConversationParticipants_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipants" DROP CONSTRAINT "ConversationParticipants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversations" DROP CONSTRAINT "Conversations_created_by_fkey";

-- DropForeignKey
ALTER TABLE "GroupJoinRequests" DROP CONSTRAINT "GroupJoinRequests_group_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupJoinRequests" DROP CONSTRAINT "GroupJoinRequests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_created_by_fkey";

-- DropForeignKey
ALTER TABLE "StoryReactions" DROP CONSTRAINT "StoryReactions_story_id_fkey";

-- DropForeignKey
ALTER TABLE "StoryReactions" DROP CONSTRAINT "StoryReactions_viewer_id_fkey";

-- AlterTable
ALTER TABLE "Conversations" DROP COLUMN "created_by",
DROP COLUMN "group_avatar_url",
DROP COLUMN "group_name",
DROP COLUMN "is_group",
DROP COLUMN "updated_at",
ADD COLUMN     "user_1_id" UUID NOT NULL,
ADD COLUMN     "user_2_id" UUID NOT NULL;

-- DropTable
DROP TABLE "ConversationParticipants";

-- DropTable
DROP TABLE "GroupJoinRequests";

-- DropTable
DROP TABLE "GroupMembers";

-- DropTable
DROP TABLE "Groups";

-- DropTable
DROP TABLE "MessageReactions";

-- DropTable
DROP TABLE "StoryReactions";

-- CreateIndex
CREATE UNIQUE INDEX "Conversations_user_1_id_user_2_id_key" ON "Conversations"("user_1_id", "user_2_id");

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_user_1_id_fkey" FOREIGN KEY ("user_1_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_user_2_id_fkey" FOREIGN KEY ("user_2_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
