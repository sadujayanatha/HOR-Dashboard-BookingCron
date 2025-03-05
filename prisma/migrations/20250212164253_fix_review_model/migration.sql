-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_channel_reference_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_propertyId_fkey";

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_channel_reference_fkey" FOREIGN KEY ("channel_reference") REFERENCES "bookings"("channel_reference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("beds24_id") ON DELETE RESTRICT ON UPDATE CASCADE;
