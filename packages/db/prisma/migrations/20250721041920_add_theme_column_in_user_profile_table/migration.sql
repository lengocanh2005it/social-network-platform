-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('system', 'dark', 'light');

-- AlterTable
ALTER TABLE "UserProfiles"
ADD COLUMN "theme" "Theme" NOT NULL DEFAULT 'system';