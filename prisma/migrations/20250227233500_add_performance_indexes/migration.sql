-- Add composite indexes for frequently queried combinations
CREATE INDEX "Version_articleId_branchId_idx" ON "Version"("articleId", "branchId");
CREATE INDEX "Version_articleId_number_idx" ON "Version"("articleId", "number");
CREATE INDEX "Branch_articleId_name_idx" ON "Branch"("articleId", "name");
CREATE INDEX "Article_authorId_status_idx" ON "Article"("authorId", "status");
CREATE INDEX "Comment_articleId_createdAt_idx" ON "Comment"("articleId", "createdAt");

-- Add indexes for foreign key lookups
CREATE INDEX "Version_branchId_idx" ON "Version"("branchId");
CREATE INDEX "Branch_userId_idx" ON "Branch"("userId");
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- Add indexes for sorting and filtering
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");
CREATE INDEX "Article_updatedAt_idx" ON "Article"("updatedAt");
CREATE INDEX "Version_createdAt_idx" ON "Version"("createdAt");
CREATE INDEX "Branch_updatedAt_idx" ON "Branch"("updatedAt");

-- Add full-text search indexes (if supported by your SQLite version)
-- Note: SQLite FTS5 module must be enabled for these to work
CREATE VIRTUAL TABLE IF NOT EXISTS "Article_fts" USING fts5(
  title, 
  content,
  content_rowid=id
);

-- Trigger to keep FTS index updated
CREATE TRIGGER IF NOT EXISTS "Article_ai" AFTER INSERT ON "Article" BEGIN
  INSERT INTO "Article_fts"(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS "Article_ad" AFTER DELETE ON "Article" BEGIN
  DELETE FROM "Article_fts" WHERE rowid = old.id;
END;

CREATE TRIGGER IF NOT EXISTS "Article_au" AFTER UPDATE ON "Article" BEGIN
  DELETE FROM "Article_fts" WHERE rowid = old.id;
  INSERT INTO "Article_fts"(rowid, title, content) VALUES (new.id, new.title, new.content);
END;
