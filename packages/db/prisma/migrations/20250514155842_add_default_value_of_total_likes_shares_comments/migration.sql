-- CreateEnum
CREATE TYPE "Helloworld" AS ENUM ('test1', 'test2');

-- AlterTable
ALTER TABLE "PostImages" ALTER COLUMN "total_likes" SET DEFAULT 0,
ALTER COLUMN "total_comments" SET DEFAULT 0,
ALTER COLUMN "total_shares" SET DEFAULT 0;
