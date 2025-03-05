/*
  Warnings:

  - A unique constraint covering the columns `[channel_reference]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "channel_reference" TEXT;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "channel_reference" TEXT,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "guest_name" TEXT,
    "reviewer_id" TEXT,
    "overall_rating" INTEGER,
    "listing_id" TEXT,
    "public_review" TEXT,
    "category_ratings" JSONB,
    "review_category_tags" JSONB,
    "submitted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_channel_reference_key" ON "reviews"("channel_reference");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_channel_reference_key" ON "bookings"("channel_reference");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_channel_reference_fkey" FOREIGN KEY ("channel_reference") REFERENCES "bookings"("channel_reference") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("beds24_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;
