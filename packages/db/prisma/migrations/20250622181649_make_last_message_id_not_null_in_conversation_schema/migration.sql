/*
  Warnings:

  - Made the column `last_message_at` on table `Conversations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_message_id` on table `Conversations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Conversations" ALTER COLUMN "last_message_at" SET NOT NULL,
ALTER COLUMN "last_message_id" SET NOT NULL;
