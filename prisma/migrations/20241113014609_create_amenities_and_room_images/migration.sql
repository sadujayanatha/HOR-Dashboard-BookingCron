-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "descriptions" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "guest_access" TEXT,
ADD COLUMN     "num_baths" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "num_bedrooms" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "num_beds" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "num_guests" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "rates" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "type" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "url" TEXT,
    "order" INTEGER,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_amenities" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "amenitiesId" INTEGER NOT NULL,
    "parentAmenitiesId" INTEGER,

    CONSTRAINT "room_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "images_roomId_idx" ON "images"("roomId");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_amenities" ADD CONSTRAINT "room_amenities_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_amenities" ADD CONSTRAINT "room_amenities_amenitiesId_fkey" FOREIGN KEY ("amenitiesId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
