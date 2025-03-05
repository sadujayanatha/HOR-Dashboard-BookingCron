-- CreateEnum
CREATE TYPE "LogScope" AS ENUM ('SERVICE_FEE');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT');

-- CreateTable
CREATE TABLE "system_logs" (
    "id" SERIAL NOT NULL,
    "actorId" INTEGER,
    "scope" "LogScope" NOT NULL,
    "action" "LogAction" NOT NULL,
    "targetId" INTEGER,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_logs_scope_idx" ON "system_logs"("scope");

-- CreateIndex
CREATE INDEX "system_logs_createdAt_idx" ON "system_logs"("createdAt");
