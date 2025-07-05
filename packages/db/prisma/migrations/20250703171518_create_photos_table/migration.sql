-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('AVATAR', 'COVER', 'POST', 'STORY');

-- CreateTable
CREATE TABLE "Photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "PhotoType" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
