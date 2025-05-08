/*
  Warnings:

  - Made the column `name` on table `HashTags` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "HashTags" ALTER COLUMN "name" SET NOT NULL;
