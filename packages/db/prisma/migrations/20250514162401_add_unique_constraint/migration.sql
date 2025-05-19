/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `HashTags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HashTags_name_key" ON "HashTags"("name");
