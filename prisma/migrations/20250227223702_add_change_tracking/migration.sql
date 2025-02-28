-- Add new fields to Edit model
ALTER TABLE "Edit" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'content';
ALTER TABLE "Edit" ADD COLUMN "metadata" TEXT;
ALTER TABLE "Edit" ADD COLUMN "versionId" TEXT;

-- Create Version model
CREATE TABLE "Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "editId" TEXT,
    FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("editId") REFERENCES "Edit" ("id") ON DELETE SET NULL
);

-- Create Diff model
CREATE TABLE "Diff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromVersionId" TEXT NOT NULL,
    "toVersionId" TEXT NOT NULL,
    FOREIGN KEY ("fromVersionId") REFERENCES "Version" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("toVersionId") REFERENCES "Version" ("id") ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX "Version_articleId_idx" ON "Version"("articleId");
CREATE INDEX "Version_number_articleId_idx" ON "Version"("number", "articleId");
CREATE INDEX "Diff_fromVersionId_idx" ON "Diff"("fromVersionId");
CREATE INDEX "Diff_toVersionId_idx" ON "Diff"("toVersionId");

-- Add unique constraint to ensure version numbers are sequential per article
CREATE UNIQUE INDEX "Version_articleId_number_key" ON "Version"("articleId", "number");
