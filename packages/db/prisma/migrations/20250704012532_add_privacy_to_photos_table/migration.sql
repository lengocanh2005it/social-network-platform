/*
  Warnings:

  - Added the required column `privacy` to the `Photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photos" ADD COLUMN     "privacy" "PostPrivacies" NOT NULL;
