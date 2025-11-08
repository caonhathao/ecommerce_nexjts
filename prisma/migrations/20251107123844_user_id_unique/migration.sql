/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `OrderDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrderDraft_userId_key" ON "OrderDraft"("userId");
