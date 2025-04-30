/*
  Warnings:

  - A unique constraint covering the columns `[finger_print,user_id]` on the table `UserDevices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserDevices_finger_print_user_id_key" ON "UserDevices"("finger_print", "user_id");
