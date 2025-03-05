-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "cancellation_id" INTEGER,
ADD COLUMN     "checkinEnd" TEXT,
ADD COLUMN     "checkinStart" TEXT,
ADD COLUMN     "checkoutStart" TEXT,
ADD COLUMN     "map_lat" TEXT,
ADD COLUMN     "map_long" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "specialNote" TEXT;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "urlslug" TEXT NOT NULL DEFAULT '-';

-- CreateTable
CREATE TABLE "cancellation_policy" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cancellation_policy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_cancellation_id_fkey" FOREIGN KEY ("cancellation_id") REFERENCES "cancellation_policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icals" ADD CONSTRAINT "icals_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;
