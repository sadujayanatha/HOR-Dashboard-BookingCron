-- CreateTable
CREATE TABLE "icals" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "arrival" TIMESTAMP(3) NOT NULL,
    "departure" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "icals_uid_key" ON "icals"("uid");
