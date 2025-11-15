-- AlterTable
ALTER TABLE "product_image" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "product_variant" ADD COLUMN     "imagePublicId" TEXT;
