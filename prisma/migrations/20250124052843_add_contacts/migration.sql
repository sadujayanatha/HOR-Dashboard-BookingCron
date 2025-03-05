-- AlterTable
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "roleId" INTEGER;

-- Add Foreign Key to users if not exists
ALTER TABLE "users"
DROP CONSTRAINT IF EXISTS "users_roleId_fkey",
ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
DROP TABLE IF EXISTS "contacts";

CREATE TABLE
    "contacts" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "email" TEXT,
        "propertyId" TEXT NOT NULL,
        "countryId" INTEGER NOT NULL,
        "roleId" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
    );

-- Drop and recreate index
DROP INDEX IF EXISTS "contacts_propertyId_roleId_key";

CREATE UNIQUE INDEX "contacts_propertyId_roleId_key" ON "contacts" ("propertyId", "roleId");

-- Add Foreign Keys
ALTER TABLE "contacts"
DROP CONSTRAINT IF EXISTS "contacts_propertyId_fkey",
ADD CONSTRAINT "contacts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("beds24_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contacts"
DROP CONSTRAINT IF EXISTS "contacts_countryId_fkey",
ADD CONSTRAINT "contacts_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contacts"
DROP CONSTRAINT IF EXISTS "contacts_roleId_fkey",
ADD CONSTRAINT "contacts_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
