-- CreateTable
CREATE TABLE "villa_photoshoot" (
    "id" SERIAL NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "rates" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "policies" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_photoshoot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "villa_photoshoot" ADD CONSTRAINT "villa_photoshoot_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("beds24_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_photoshoot" ADD CONSTRAINT "villa_photoshoot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;
