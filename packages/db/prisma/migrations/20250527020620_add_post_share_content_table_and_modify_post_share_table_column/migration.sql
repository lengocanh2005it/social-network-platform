/*
  Warnings:

  - The primary key for the `PostShares` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `privacy` to the `PostShares` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostShares" DROP CONSTRAINT "PostShares_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "privacy" "PostPrivacies" NOT NULL,
ADD CONSTRAINT "PostShares_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "PostShareContents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "type" "PostContentType" NOT NULL DEFAULT 'text',
    "language" "PostContentLanguage" NOT NULL DEFAULT 'en',
    "post_share_id" UUID NOT NULL,

    CONSTRAINT "PostShareContents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostShareContents" ADD CONSTRAINT "PostShareContents_post_share_id_fkey" FOREIGN KEY ("post_share_id") REFERENCES "PostShares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
