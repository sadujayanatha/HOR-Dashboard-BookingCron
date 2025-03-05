-- CreateTable
CREATE TABLE "cron_entry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cron_entry_pkey" PRIMARY KEY ("id")
);
