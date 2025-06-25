/*
  Warnings:

  - A unique constraint covering the columns `[last_message_id]` on the table `Conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversations" ADD COLUMN     "last_message_at" TIMESTAMP(3),
ADD COLUMN     "last_message_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Conversations_last_message_id_key" ON "Conversations"("last_message_id");

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
