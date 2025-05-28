/*
  Warnings:

  - Made the column `post_id` on table `Comments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comments" ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "post_id" SET NOT NULL;
