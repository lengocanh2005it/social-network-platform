/*
  Warnings:

  - A unique constraint covering the columns `[finger_print]` on the table `UserDevices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fist_name` to the `UserProfiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `UserProfiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfiles" ADD COLUMN     "fist_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "unique_finger_print" ON "UserDevices"("finger_print");
