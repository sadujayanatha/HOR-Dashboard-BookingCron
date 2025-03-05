-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE_VALUE', 'FIXED_VALUE');

-- CreateEnum
CREATE TYPE "BookingConditionType" AS ENUM ('LAST_MINUTE_BOOKING', 'EARLY_BOOKING');

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minLengthOfStay" INTEGER,
    "purchaseStartDate" TIMESTAMP(3),
    "purchaseEndDate" TIMESTAMP(3),
    "stayStartDate" TIMESTAMP(3),
    "stayEndDate" TIMESTAMP(3),
    "mustBeBookedType" "BookingConditionType",
    "mustBeBookedDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "overlapping" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_promos" (
    "id" SERIAL NOT NULL,
    "promoId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "property_promos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- AddForeignKey
ALTER TABLE "property_promos" ADD CONSTRAINT "property_promos_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_promos" ADD CONSTRAINT "property_promos_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("beds24_id") ON DELETE CASCADE ON UPDATE CASCADE;
