-- DropForeignKey
ALTER TABLE "public"."order_item" DROP CONSTRAINT "order_item_draft_fkey";

-- AlterTable
ALTER TABLE "OrderDraft" ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "orderDraftId" UUID,
ALTER COLUMN "orderId" DROP NOT NULL;

-- RenameForeignKey
ALTER TABLE "order_item" RENAME CONSTRAINT "order_item_order_fkey" TO "order_item_orderId_fkey";

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderDraftId_fkey" FOREIGN KEY ("orderDraftId") REFERENCES "OrderDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
