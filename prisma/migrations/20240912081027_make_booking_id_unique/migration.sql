/*
  Warnings:

  - A unique constraint covering the columns `[booking_id]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_id_key" ON "bookings"("booking_id");
