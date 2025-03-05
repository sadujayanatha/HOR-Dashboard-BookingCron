-- CreateEnum
CREATE TYPE "ExpenseCategoryType" AS ENUM ('COMMON', 'ELECTRICITY', 'DAILY_WORKER');

-- AlterTable
ALTER TABLE "expense_categories" ADD COLUMN     "type" "ExpenseCategoryType" NOT NULL DEFAULT 'COMMON';

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "roomId" TEXT;

-- CreateTable
CREATE TABLE "electricity_expense_details" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "beforeRecharge" DOUBLE PRECISION NOT NULL,
    "afterRecharge" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "electricity_expense_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_worker_expense_details" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_worker_expense_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "electricity_expense_details_expenseId_key" ON "electricity_expense_details"("expenseId");

-- CreateIndex
CREATE INDEX "electricity_expense_details_expenseId_idx" ON "electricity_expense_details"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_worker_expense_details_expenseId_key" ON "daily_worker_expense_details"("expenseId");

-- CreateIndex
CREATE INDEX "daily_worker_expense_details_expenseId_idx" ON "daily_worker_expense_details"("expenseId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electricity_expense_details" ADD CONSTRAINT "electricity_expense_details_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_worker_expense_details" ADD CONSTRAINT "daily_worker_expense_details_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
