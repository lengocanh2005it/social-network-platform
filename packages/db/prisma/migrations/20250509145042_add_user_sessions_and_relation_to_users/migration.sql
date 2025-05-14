-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'inactive', 'expired');

-- DropIndex
DROP INDEX "UserDevices_user_id_key";

-- CreateTable
CREATE TABLE "UserSessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "refresh_token" TEXT NOT NULL,
    "finger_print" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "last_login_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "UserSessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSessions_user_id_finger_print_key" ON "UserSessions"("user_id", "finger_print");

-- AddForeignKey
ALTER TABLE "UserSessions" ADD CONSTRAINT "UserSessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
