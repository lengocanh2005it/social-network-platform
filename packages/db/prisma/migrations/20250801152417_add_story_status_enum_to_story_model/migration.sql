-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('active', 'inactive', 'expired');

-- AlterTable
ALTER TABLE "Stories" ADD COLUMN     "status" "StoryStatus" NOT NULL DEFAULT 'active';
