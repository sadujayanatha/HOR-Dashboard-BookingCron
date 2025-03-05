/*
  Warnings:

  - You are about to drop the column `createdAt` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `content` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `byUser` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metaDescription` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metaTitle` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "content" DROP COLUMN "createdAt",
DROP COLUMN "status",
ADD COLUMN     "byUser" INTEGER NOT NULL,
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "metaDescription" TEXT NOT NULL,
ADD COLUMN     "metaTitle" TEXT NOT NULL,
ADD COLUMN     "page" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "page" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "keywords" TEXT,
    "content" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "byUser" INTEGER NOT NULL,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_slug_key" ON "page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_slug_key" ON "content"("slug");
