-- CreateTable
CREATE TABLE
    "contact_requests" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "archived" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
    );
