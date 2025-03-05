/*
  Warnings:

  - You are about to drop the column `propertyId` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the `system_logs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roleId]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_propertyId_fkey";

-- DropIndex
DROP INDEX "contacts_propertyId_roleId_key";

-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "propertyId",
ADD COLUMN     "propertyIds" TEXT[];

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "accountingContactId" INTEGER,
ADD COLUMN     "hostContactId" INTEGER,
ADD COLUMN     "listingsContactId" INTEGER,
ADD COLUMN     "reservationContactId" INTEGER;

-- DropTable
DROP TABLE "system_logs";

-- DropEnum
DROP TYPE "LogAction";

-- DropEnum
DROP TYPE "LogScope";

-- CreateTable
CREATE TABLE "_ContactToProperty" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContactToProperty_AB_unique" ON "_ContactToProperty"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactToProperty_B_index" ON "_ContactToProperty"("B");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_roleId_key" ON "contacts"("roleId");

-- AddForeignKey
ALTER TABLE "_ContactToProperty" ADD CONSTRAINT "_ContactToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToProperty" ADD CONSTRAINT "_ContactToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "properties"("beds24_id") ON DELETE CASCADE ON UPDATE CASCADE;
