/*
  Warnings:

  - You are about to drop the column `shopId` on the `OrderDraft` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."OrderDraft_shopId_orderId_idx";

-- AlterTable
ALTER TABLE "OrderDraft" DROP COLUMN "shopId";

-- CreateIndex
CREATE INDEX "OrderDraft_orderId_idx" ON "OrderDraft"("orderId");
