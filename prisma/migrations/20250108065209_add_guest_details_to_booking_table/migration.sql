-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "guest_email" TEXT,
ADD COLUMN     "guest_phone" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "num_adult" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "num_children" INTEGER NOT NULL DEFAULT 0;
