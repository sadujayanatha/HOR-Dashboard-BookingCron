/*
  Warnings:

  - A unique constraint covering the columns `[booking_id]` on the table `incomes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `booking_id` to the `incomes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "incomes" ADD COLUMN     "booking_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "incomes_booking_id_key" ON "incomes"("booking_id");
