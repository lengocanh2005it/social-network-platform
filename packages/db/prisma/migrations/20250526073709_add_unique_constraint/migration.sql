/*
  Warnings:

  - A unique constraint covering the columns `[user_id,comment_id]` on the table `CommentLikes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CommentLikes_user_id_comment_id_key" ON "CommentLikes"("user_id", "comment_id");
