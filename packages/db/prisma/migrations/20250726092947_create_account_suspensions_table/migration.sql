/*
  Warnings:

  - The primary key for the `Reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Reports" DROP CONSTRAINT "Reports_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Reports_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "AccountSuspensions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reason" TEXT NOT NULL,
    "suspended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "un_uspended_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "is_permanent" BOOLEAN NOT NULL,
    "user_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,

    CONSTRAINT "AccountSuspensions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccountSuspensions" ADD CONSTRAINT "AccountSuspensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSuspensions" ADD CONSTRAINT "AccountSuspensions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
