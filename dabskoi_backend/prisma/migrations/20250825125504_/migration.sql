/*
  Warnings:

  - Made the column `address` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
