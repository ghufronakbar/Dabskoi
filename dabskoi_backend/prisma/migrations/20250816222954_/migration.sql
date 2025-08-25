/*
  Warnings:

  - The values [NEGO_RESPONSE_RECEIPT,AUCTION_RESPONSE_RECEIPT,SELL_RESPONSE_RECEIPT] on the enum `ChatType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChatType_new" AS ENUM ('TEXT', 'IMAGE', 'REFERENCE_SELL', 'REFERENCE_NEGO', 'REFERENCE_AUCTION', 'NEGO_RESPONSE_ACCEPT', 'NEGO_RESPONSE_REJECT', 'NEGO_REQUEST', 'AUCTION_RESPONSE_ACCEPT', 'AUCTION_RESPONSE_REJECT', 'AUCTION_REQUEST');
ALTER TABLE "Chat" ALTER COLUMN "type" TYPE "ChatType_new" USING ("type"::text::"ChatType_new");
ALTER TYPE "ChatType" RENAME TO "ChatType_old";
ALTER TYPE "ChatType_new" RENAME TO "ChatType";
DROP TYPE "ChatType_old";
COMMIT;
