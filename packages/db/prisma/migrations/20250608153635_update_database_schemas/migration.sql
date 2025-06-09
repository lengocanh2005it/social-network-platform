/*
  Warnings:

  - The values [tagged_in_comment,group_invite,group_join_request,group_role_changed,followed_you,birthday_reminder] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `messages` on the `Notifications` table. All the data in the column will be lost.
  - Added the required column `content` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('friend_request', 'friend_request_accepted', 'friend_request_rejected', 'post_liked', 'post_commented', 'comment_liked', 'comment_replied', 'post_shared', 'tagged_in_post', 'story_added_by_friend', 'system_announcement');
ALTER TABLE "Notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "messages",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "sender_id" UUID;

-- DropEnum
DROP TYPE "GroupMemberRole";

-- CreateIndex
CREATE INDEX "Notifications_recipient_id_idx" ON "Notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "Notifications_recipient_id_is_read_idx" ON "Notifications"("recipient_id", "is_read");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
