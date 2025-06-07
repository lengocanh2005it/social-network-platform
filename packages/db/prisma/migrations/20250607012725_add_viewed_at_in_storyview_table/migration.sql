-- AlterTable
ALTER TABLE "StoryViews" ADD COLUMN     "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "GroupJoinRequestsStatus";
