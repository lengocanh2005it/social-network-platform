/*
Warnings:

- Made the column `content` on table `Comments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comments" ALTER COLUMN "content" SET NOT NULL;