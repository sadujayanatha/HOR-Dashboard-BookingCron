/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `promo_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_name_key" ON "promo_codes"("name");
