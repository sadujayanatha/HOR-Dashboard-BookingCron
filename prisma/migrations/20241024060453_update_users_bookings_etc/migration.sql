-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "adr" DOUBLE PRECISION,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "hor_payout" DOUBLE PRECISION,
ADD COLUMN     "owner_payout" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastLogin" TIMESTAMP(3);
