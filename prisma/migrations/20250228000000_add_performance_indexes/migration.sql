-- Add composite indexes for frequently queried combinations
CREATE INDEX "Version_articleId_branchId_idx" ON "Version"("articleId", "branchId");
CREATE INDEX "Version_articleId_number_idx" ON "Version"("articleId", "number");
CREATE INDEX "Branch_articleId_name_idx" ON "Branch"("articleId", "name");
CREATE INDEX "Article_authorId_status_idx" ON "Article"("authorId", "status");
CREATE INDEX "Comment_articleId_createdAt_idx" ON "Comment"("articleId", "createdAt");

-- Add indexes for foreign key lookups
-- Version_branchId_idx is already created in add_branch_management migration
-- Branch_userId_idx is already created in add_branch_management migration
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- Add indexes for sorting and filtering
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");
CREATE INDEX "Article_updatedAt_idx" ON "Article"("updatedAt");
CREATE INDEX "Version_createdAt_idx" ON "Version"("createdAt");
CREATE INDEX "Branch_updatedAt_idx" ON "Branch"("updatedAt");

-- Full-text search removed due to compatibility issues
