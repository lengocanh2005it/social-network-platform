/*
  Warnings:

  - The values [appcepted] on the enum `FriendShipStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FriendShipStatus_new" AS ENUM ('accepted', 'rejected', 'pending');
ALTER TABLE "Friends" ALTER COLUMN "friendship_status" DROP DEFAULT;
ALTER TABLE "Friends" ALTER COLUMN "friendship_status" TYPE "FriendShipStatus_new" USING ("friendship_status"::text::"FriendShipStatus_new");
ALTER TYPE "FriendShipStatus" RENAME TO "FriendShipStatus_old";
ALTER TYPE "FriendShipStatus_new" RENAME TO "FriendShipStatus";
DROP TYPE "FriendShipStatus_old";
ALTER TABLE "Friends" ALTER COLUMN "friendship_status" SET DEFAULT 'pending';
COMMIT;
