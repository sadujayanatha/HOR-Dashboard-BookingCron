/*
  Warnings:

  - A unique constraint covering the columns `[booking_id,date]` on the table `incomes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "incomes_booking_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "incomes_booking_id_date_key" ON "incomes"("booking_id", "date");
