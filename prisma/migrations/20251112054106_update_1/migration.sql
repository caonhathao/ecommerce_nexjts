/*
  Warnings:

  - The values [USER,SELLER,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `displayName` on the `user_profile` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('user', 'seller', 'admin');
ALTER TABLE "public"."shop_member" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "shop_member" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "shop_member" ALTER COLUMN "role" SET DEFAULT 'seller';
COMMIT;

-- AlterTable
ALTER TABLE "shop_member" ALTER COLUMN "role" SET DEFAULT 'seller';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "displayName",
ADD COLUMN     "emailForBill" TEXT;
