-- CreateTable
CREATE TABLE "periods" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER,
    "color_hex" VARCHAR(7) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "period_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "color_hex" VARCHAR(7) NOT NULL,
    "icon" VARCHAR(50),
    "description" TEXT,
    "parent_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "philosophers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "birth_year" INTEGER,
    "death_year" INTEGER,
    "nationality" VARCHAR(100),
    "school_id" INTEGER,
    "period_id" INTEGER,
    "bio_short" TEXT,
    "bio_long" TEXT,
    "image_url" VARCHAR(500),
    "wikipedia_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "philosophers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statements" (
    "id" SERIAL NOT NULL,
    "philosopher_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "text_original" TEXT,
    "language" VARCHAR(10) NOT NULL DEFAULT 'es',
    "category_id" INTEGER NOT NULL,
    "is_direct_quote" BOOLEAN NOT NULL DEFAULT false,
    "context" TEXT,
    "order_in_timeline" INTEGER,
    "x_position" DECIMAL(10,2),
    "y_position" DECIMAL(10,2),
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "popularity_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" SERIAL NOT NULL,
    "statement_from_id" INTEGER NOT NULL,
    "statement_to_id" INTEGER NOT NULL,
    "connection_type" VARCHAR(20) NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 3,
    "explanation" TEXT,
    "is_bidirectional" BOOLEAN NOT NULL DEFAULT true,
    "verified_by" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "color_hex" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_tags" (
    "statement_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "statement_tags_pkey" PRIMARY KEY ("statement_id","tag_id")
);

-- CreateTable
CREATE TABLE "references" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "title" TEXT NOT NULL,
    "author" VARCHAR(300),
    "year" INTEGER,
    "publisher" VARCHAR(200),
    "isbn" VARCHAR(20),
    "doi" VARCHAR(100),
    "url" VARCHAR(500),
    "page_numbers" VARCHAR(50),
    "full_citation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_references" (
    "statement_id" INTEGER NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "page_specific" VARCHAR(20),

    CONSTRAINT "statement_references_pkey" PRIMARY KEY ("statement_id","reference_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "password_hash" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "periods_slug_key" ON "periods"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "schools_slug_key" ON "schools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "philosophers_slug_key" ON "philosophers"("slug");

-- CreateIndex
CREATE INDEX "statements_philosopher_id_idx" ON "statements"("philosopher_id");

-- CreateIndex
CREATE INDEX "statements_category_id_idx" ON "statements"("category_id");

-- CreateIndex
CREATE INDEX "statements_order_in_timeline_idx" ON "statements"("order_in_timeline");

-- CreateIndex
CREATE INDEX "connections_statement_from_id_idx" ON "connections"("statement_from_id");

-- CreateIndex
CREATE INDEX "connections_statement_to_id_idx" ON "connections"("statement_to_id");

-- CreateIndex
CREATE INDEX "connections_connection_type_idx" ON "connections"("connection_type");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "philosophers" ADD CONSTRAINT "philosophers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "philosophers" ADD CONSTRAINT "philosophers_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statements" ADD CONSTRAINT "statements_philosopher_id_fkey" FOREIGN KEY ("philosopher_id") REFERENCES "philosophers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statements" ADD CONSTRAINT "statements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_statement_from_id_fkey" FOREIGN KEY ("statement_from_id") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_statement_to_id_fkey" FOREIGN KEY ("statement_to_id") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_tags" ADD CONSTRAINT "statement_tags_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_tags" ADD CONSTRAINT "statement_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_references" ADD CONSTRAINT "statement_references_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statement_references" ADD CONSTRAINT "statement_references_reference_id_fkey" FOREIGN KEY ("reference_id") REFERENCES "references"("id") ON DELETE CASCADE ON UPDATE CASCADE;
