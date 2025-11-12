/*
  Warnings:

  - The primary key for the `order_voucher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[orderId,voucherId]` on the table `order_voucher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voucherId,orderDraftId]` on the table `order_voucher` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `order_voucher` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "order_voucher" DROP CONSTRAINT "order_voucher_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL,
ADD CONSTRAINT "order_voucher_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_voucher_orderId_voucherId_key" ON "order_voucher"("orderId", "voucherId");

-- CreateIndex
CREATE UNIQUE INDEX "order_voucher_voucherId_orderDraftId_key" ON "order_voucher"("voucherId", "orderDraftId");
