-- AlterTable
ALTER TABLE "connections" ADD COLUMN     "confidence" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "source_author" VARCHAR(200),
ADD COLUMN     "source_pages" VARCHAR(50),
ADD COLUMN     "source_title" VARCHAR(500),
ADD COLUMN     "source_type" VARCHAR(50),
ADD COLUMN     "source_url" VARCHAR(500),
ADD COLUMN     "source_year" INTEGER;
