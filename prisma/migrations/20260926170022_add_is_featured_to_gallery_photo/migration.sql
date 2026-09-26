-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "GalleryPhoto_isFeatured_idx" ON "GalleryPhoto"("isFeatured");
