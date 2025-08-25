/*
  Warnings:

  - You are about to drop the column `unreadAdmin` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `unreadUser` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "unreadAdmin",
DROP COLUMN "unreadUser",
ADD COLUMN     "readByAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readByUser" BOOLEAN NOT NULL DEFAULT false;
