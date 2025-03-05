-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "channel" VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
