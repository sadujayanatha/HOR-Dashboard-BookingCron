-- CreateTable
CREATE TABLE
    "countries" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
    );
