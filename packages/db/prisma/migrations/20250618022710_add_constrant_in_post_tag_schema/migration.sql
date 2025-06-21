/*
  Warnings:

  - A unique constraint covering the columns `[post_id,tagged_user_id]` on the table `PostTags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostTags_post_id_tagged_user_id_key" ON "PostTags"("post_id", "tagged_user_id");
