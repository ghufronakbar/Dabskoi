/*
  Warnings:

  - You are about to drop the `Banner` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "address" SET DEFAULT '',
ALTER COLUMN "phone" SET DEFAULT '';

-- DropTable
DROP TABLE "Banner";
