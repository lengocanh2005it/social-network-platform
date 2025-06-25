-- AlterTable
ALTER TABLE "Conversations" ALTER COLUMN "last_message_at" DROP NOT NULL,
ALTER COLUMN "last_message_id" DROP NOT NULL;
