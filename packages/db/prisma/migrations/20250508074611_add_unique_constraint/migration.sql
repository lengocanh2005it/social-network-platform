/*
  Warnings:

  - A unique constraint covering the columns `[social_name,user_id]` on the table `UserSocials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSocials_social_name_user_id_key" ON "UserSocials"("social_name", "user_id");
