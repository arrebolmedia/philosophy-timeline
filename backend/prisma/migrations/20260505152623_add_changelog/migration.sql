-- CreateTable
CREATE TABLE "changelog" (
    "id" SERIAL NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelog_pkey" PRIMARY KEY ("id")
);
