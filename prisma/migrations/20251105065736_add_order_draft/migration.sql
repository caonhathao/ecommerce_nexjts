-- AlterTable
ALTER TABLE "order_voucher" ADD COLUMN     "orderDraftId" UUID;

-- CreateTable
CREATE TABLE "OrderDraft" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_PAID',
    "currency" "Currency" NOT NULL DEFAULT 'VND',
    "itemsTotal" DECIMAL(14,2) NOT NULL,
    "shippingFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL,
    "shippingInfor" JSONB NOT NULL,
    "notes" TEXT,

    CONSTRAINT "OrderDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderDraft_orderNumber_key" ON "OrderDraft"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDraft_orderId_key" ON "OrderDraft"("orderId");

-- CreateIndex
CREATE INDEX "OrderDraft_userId_placedAt_idx" ON "OrderDraft"("userId", "placedAt");

-- CreateIndex
CREATE INDEX "OrderDraft_shopId_orderId_idx" ON "OrderDraft"("shopId", "orderId");

-- RenameForeignKey
ALTER TABLE "order_item" RENAME CONSTRAINT "order_item_orderId_fkey" TO "order_item_order_fkey";

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_draft_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderDraft"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDraft" ADD CONSTRAINT "OrderDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDraft" ADD CONSTRAINT "OrderDraft_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_voucher" ADD CONSTRAINT "order_voucher_orderDraftId_fkey" FOREIGN KEY ("orderDraftId") REFERENCES "OrderDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
