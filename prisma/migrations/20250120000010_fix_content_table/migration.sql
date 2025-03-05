/*
  Warnings:

  - You are about to drop the column `byUser` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `page` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `content` table. All the data in the column will be lost.
  - Added the required column `status` to the `content` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "content_slug_key";

-- AlterTable
ALTER TABLE "content" DROP COLUMN "byUser",
DROP COLUMN "keywords",
DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle",
DROP COLUMN "page",
DROP COLUMN "slug",
ADD COLUMN     "status" BOOLEAN NOT NULL;
